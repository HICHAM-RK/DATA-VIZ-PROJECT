// Load the CSV data using d3.dsv (semicolon as separator)
d3.dsv(";", "netflix_titles.csv").then(function(data) {

    // Log the first few rows of the data to see what we have
    console.log("First 5 rows of data:", data.slice(0, 5));

    // Function to parse duration from the 'duration' column (e.g., "90 min" -> 90)
    function parseDuration(duration) {
        const match = duration.match(/(\d+)\s*min/); // Match the numeric value before "min"
        return match ? parseInt(match[1], 10) : 0;
    }

    // Function to filter and update the chart based on selected year
    function updateChart(year) {
        const filteredData = data
            .map(d => {
                return {
                    title: d["title"],
                    duration: parseDuration(d["duration"]),
                    releaseYear: d["release_year"] // Extract release year
                };
            })
            .filter(d => !year || d.releaseYear == year) // Filter by the selected year, if any
            .sort((a, b) => b.duration - a.duration) // Sort by duration in descending order
            .slice(0, 10); // Get the top 10

        // Log the filtered data to check
        console.log("Filtered Data:", filteredData);

        // Clear the existing chart before re-rendering
        d3.select("#top10-container").select("svg").remove();

        // Re-render the chart with the filtered data
        renderChart(filteredData);
    }

    // Function to render the chart
    function renderChart(top10ByDuration) {
        // Set up the SVG for the horizontal bar chart
        const margin = { top: 80, right: 200, bottom: 50, left: 250 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        // Create the SVG container
        const svg = d3.select("#top10-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set the x and y scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(top10ByDuration, d => d.duration)])
            .nice()
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(top10ByDuration.map(d => d.title))
            .range([0, height])
            .padding(0.1);

        // Append the bars to the chart
        const bars = svg.selectAll(".bar")
            .data(top10ByDuration)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.title))
            .attr("width", d => x(d.duration))
            .attr("height", y.bandwidth())
            .attr("fill", "steelblue");

        // Add the labels on the bars
        svg.selectAll(".label")
            .data(top10ByDuration)
          .enter().append("text")
            .attr("class", "label")
            .attr("x", d => x(d.duration) + 5) // Position the label at the end of the bar
            .attr("y", d => y(d.title) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("fill", "black")
            .style("font-size", "14px")
            .text(d => `${d.title} (${d.duration} min)`);

        // Add x-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -20)  // Adjusted the y-position for more space between title and bars
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Top 10 Longest Titles by Duration");

        // Create a tooltip div and append to the body
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        // Show the tooltip on mouseover
        bars.on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 0.9); // Fade in
            tooltip.html(`${d.title}<br/>Duration: ${d.duration} min`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        // Hide the tooltip on mouseout
        .on("mouseout", function() {
            tooltip.transition().duration(200).style("opacity", 0); // Fade out
        });
    }

    // Initialize the chart with all data
    updateChart(""); // Empty string means no filter (show all data initially)

    // Listen for changes on the year dropdown
    const yearFilter = document.getElementById("year-filter");
    years.forEach(function(year) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

}).catch(function(error) {
    console.error("Error loading the data:", error);
});
