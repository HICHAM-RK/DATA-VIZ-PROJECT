// Load CSV data
d3.dsv(";", "netflix_titles.csv").then(function (data) {
    console.log("Loaded data:", data);

    // Parse genres into an array
    function parseGenres(listedIn) {
        return listedIn ? listedIn.split(",").map((genre) => genre.trim()) : [];
    }

    let genreCounts = {};

    // Process each row of data
    data.forEach(function (d) {
        const country = d["country"] ? d["country"].trim() : null; // Trim whitespace
        const genres = parseGenres(d["listed_in"]);

        if (country && genres.length > 0) {
            if (!genreCounts[country]) {
                genreCounts[country] = {};
            }

            genres.forEach(function (genre) {
                if (!genreCounts[country][genre]) {
                    genreCounts[country][genre] = 0;
                }
                genreCounts[country][genre] += 1;
            });
        }
    });

    // Prepare data for the heatmap
    let heatmapData = [];
    for (let country in genreCounts) {
        for (let genre in genreCounts[country]) {
            heatmapData.push({
                country: country,
                genre: genre,
                count: genreCounts[country][genre],
            });
        }
    }

    console.log("Heatmap Data:", heatmapData);

    // Render Heatmap
    function renderHeatmap(data) {
        const margin = { top: 120, right: 20, bottom: 120, left: 200 };
        const cellPadding = 2;

        const countries = Array.from(
            new Set(data.map((d) => d.country)) // Ensure unique country names
        ).sort();
        const genres = Array.from(new Set(data.map((d) => d.genre))).sort();

        const cellWidth = 20;
        const cellHeight = 20;

        const width = cellWidth * genres.length;
        const height = cellHeight * countries.length;

        const svg = d3
            .select("#heatmap-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand().domain(genres).range([0, width]);
        const y = d3.scaleBand().domain(countries).range([0, height]);
        const color = d3
            .scaleSequential(d3.interpolateYlGnBu)
            .domain([0, d3.max(data, (d) => d.count)]);

        // Add X-axis
        svg
            .append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "10px");

        // Add Y-axis
        svg
            .append("g")
            .call(d3.axisLeft(y).tickSize(0))
            .selectAll("text")
            .style("font-size", "10px");

        // Tooltip
        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "#fff")
            .style("padding", "8px")
            .style("border-radius", "5px")
            .style("opacity", 0);

        // Draw Cells
        svg
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.genre))
            .attr("y", (d) => y(d.country))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", (d) => color(d.count))
            .style("stroke", "#ccc")
            .style("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                tooltip
                    .style("opacity", 1)
                    .html(
                        `<strong>Country:</strong> ${d.country}<br><strong>Genre:</strong> ${d.genre}<br><strong>Count:</strong> ${d.count}`
                    )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        // Title
        svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Country vs. Genre Popularity Heatmap");
    }

    renderHeatmap(heatmapData);
}).catch(function (error) {
    console.error("Error loading data:", error);
});
