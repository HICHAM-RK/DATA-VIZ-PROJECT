// Load the CSV data using d3.dsv (semicolon as separator)
d3.dsv(";", "netflix_titles.csv").then(function(data) {

    console.log("First 5 rows of data:", data.slice(0, 5));

    function parseDuration(duration) {
        const match = duration.match(/(\d+)\s*min/);
        return match ? parseInt(match[1], 10) : 0;
    }

    function updateChart(year) {
        const filteredData = data
            .map(d => ({
                title: d["title"],
                duration: parseDuration(d["duration"]),
                releaseYear: d["release_year"]
            }))
            .filter(d => !year || d.releaseYear == year)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);

        console.log("Filtered Data:", filteredData);

        d3.select("#top10-container").select("svg").remove();
        renderChart(filteredData);
    }

    function renderChart(top10ByDuration) {
        const margin = { top: 80, right: 200, bottom: 50, left: 250 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#top10-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, d3.max(top10ByDuration, d => d.duration)])
            .nice()
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(top10ByDuration.map(d => d.title))
            .range([0, height])
            .padding(0.1);

        const bars = svg.selectAll(".bar")
            .data(top10ByDuration)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.title))
            .attr("width", d => x(d.duration))
            .attr("height", y.bandwidth())
            .attr("fill", "steelblue");

        svg.selectAll(".label")
            .data(top10ByDuration)
          .enter().append("text")
            .attr("class", "label")
            .attr("x", d => x(d.duration) + 5)
            .attr("y", d => y(d.title) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("fill", "black")
            .style("font-size", "14px")
            .text(d => `${d.duration} min`);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Top 10 Longest Titles by Duration");

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        bars.on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`<strong>Title:</strong> ${d.title}<br/><strong>Duration:</strong> ${d.duration} min`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(200).style("opacity", 0);
        });
    }

    updateChart("");

    const yearFilter = document.getElementById("year-filter");
    yearFilter.addEventListener("change", function() {
        updateChart(this.value);
    });

}).catch(function(error) {
    console.error("Error loading the data:", error);
});
