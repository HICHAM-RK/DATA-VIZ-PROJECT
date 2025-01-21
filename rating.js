d3.dsv(";", "netflix_titles.csv").then(function(data) {
    const ratingDescriptions = {
        "G": "General audiences – All ages admitted.",
        "PG": "Parental guidance suggested – Some material may not be suitable for children.",
        "PG-13": "Parents strongly cautioned – Some material may be inappropriate for children under 13.",
        "R": "Restricted – Under 17 requires accompanying parent or adult guardian.",
        "NC-17": "Adults only – No one 17 and under admitted.",
        "TV-Y": "Suitable for all children.",
        "TV-Y7": "Suitable for older children (ages 7 and up).",
        "TV-G": "General audience – Suitable for all ages.",
        "TV-PG": "Parental guidance suggested – May contain some material unsuitable for younger children.",
        "TV-14": "Parents strongly cautioned – May not be suitable for children under 14.",
        "TV-MA": "Mature audience only – May not be suitable for children under 17."
    };

    const ratingCounts = {};
    const years = new Set();
    const validRatings = new Set(Object.keys(ratingDescriptions));

    data.forEach(function(d) {
        let rating = d['rating'];
        let year = d['release_year'];

        if (rating) {
            rating = rating.trim().toUpperCase();
            rating = rating.replace("TV MA", "TV-MA");
            if (validRatings.has(rating)) {
                if (!ratingCounts[rating]) {
                    ratingCounts[rating] = 0;
                }
                ratingCounts[rating]++;
            }
        }

        if (year && !isNaN(year)) {
            years.add(year);
        }
    });

    const yearFilter = document.getElementById("year-filter");

    // Convert the set to an array, cast to numbers, and sort
    const sortedYears = Array.from(years)
        .map(year => parseInt(year, 10)) // Ensure years are integers
        .filter(year => !isNaN(year))   // Remove invalid years
        .sort((a, b) => a - b);         // Sort numerically
    
    // Append the sorted years to the dropdown
    sortedYears.forEach(function(year) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    function renderBarChart(filteredData) {
        const filteredRatingCounts = {};
        filteredData.forEach(function(d) {
            let rating = d['rating'];
            if (rating) {
                rating = rating.trim().toUpperCase();
                rating = rating.replace("TV MA", "TV-MA");
                if (validRatings.has(rating)) {
                    if (!filteredRatingCounts[rating]) {
                        filteredRatingCounts[rating] = 0;
                    }
                    filteredRatingCounts[rating]++;
                }
            }
        });

        const barData = Object.keys(filteredRatingCounts).map(function(rating) {
            return { label: rating, value: filteredRatingCounts[rating] };
        });

        const width = 800;
        const height = 500;
        const margin = { top: 20, right: 20, bottom: 100, left: 100 };

        const x = d3.scaleBand()
            .range([0, width - margin.left - margin.right])
            .padding(0.1)
            .domain(barData.map(function(d) { return d.label; }));

        const y = d3.scaleLinear()
            .range([height - margin.top - margin.bottom, 0])
            .domain([0, d3.max(barData, function(d) { return d.value; })]);

        const svg = d3.select("#chart-container")
            .html('')
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("display", "none");

        svg.selectAll(".bar")
            .data(barData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.label); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - margin.top - margin.bottom - y(d.value); })
            .attr("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block")
                    .html(
                        `<strong>Rating:</strong> ${d.label}<br>` +
                        `<strong>Count:</strong> ${d.value}<br>` +
                        `<strong>Description:</strong> ${ratingDescriptions[d.label]}`
                    );
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
            });

        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("transform", "rotate(-40)")
            .attr("dx", "-0.5em")
            .attr("dy", "1em");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll(".text")
            .data(barData)
            .enter().append("text")
            .attr("class", "text")
            .attr("x", function(d) { return x(d.label) + x.bandwidth() / 2; })
            .attr("y", function(d) { return y(d.value) - 5; })
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(function(d) { return d.value; });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -3)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text("Content Rating Analysis");
    }

    renderBarChart(data);

    document.getElementById("year-filter").addEventListener("change", function(event) {
        const selectedYear = event.target.value;
        const filteredData = selectedYear 
            ? data.filter(d => d['release_year'] == selectedYear) 
            : data;
        renderBarChart(filteredData);
    });

}).catch(function(error) {
    console.error("Error loading the CSV file:", error);
});
