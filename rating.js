// Load the CSV file
d3.dsv(";", "netflix_titles.csv").then(function(data) {
    const ratingCounts = {};
    const years = new Set();  // To store unique years for filtering
    const validRatings = new Set([
        "G", "NC-17", "NR", "PG", "PG-13", "R", 
        "TV-14", "TV-G", "TV-MA", "TV-PG", "TV-Y", "TV-Y7"
    ]);

    // Loop through the data and clean/normalize the rating field
    data.forEach(function(d) {
        let rating = d['rating'];  // Adjust column name if necessary
        let year = d['release_year'];  // Adjust column name if necessary

        // Clean and normalize the rating
        if (rating) {
            rating = rating.trim().toUpperCase();
            rating = rating.replace("TV MA", "TV-MA"); // Fix "TV MA" inconsistency

            // Only count valid ratings
            if (validRatings.has(rating)) {
                if (!ratingCounts[rating]) {
                    ratingCounts[rating] = 0;
                }
                ratingCounts[rating]++;
            }
        }

        // Collect unique years for filtering
        if (year && !isNaN(year)) {
            years.add(year);
        }
    });

    // Populate the year filter dropdown
    const yearFilter = document.getElementById("year-filter");
    years.forEach(function(year) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    // Function to render the bar chart based on the filtered data
    function renderBarChart(filteredData) {
        const filteredRatingCounts = {};
        filteredData.forEach(function(d) {
            let rating = d['rating'];

            // Clean and normalize the rating
            if (rating) {
                rating = rating.trim().toUpperCase();
                rating = rating.replace("TV MA", "TV-MA");

                // Only count valid ratings
                if (validRatings.has(rating)) {
                    if (!filteredRatingCounts[rating]) {
                        filteredRatingCounts[rating] = 0;
                    }
                    filteredRatingCounts[rating]++;
                }
            }
        });

        // Prepare the data for the bar chart
        const barData = Object.keys(filteredRatingCounts).map(function(rating) {
            return { label: rating, value: filteredRatingCounts[rating] };
        });

        // Set dimensions and margins
        const width = 800;
        const height = 500;
        const margin = { top: 20, right: 20, bottom: 100, left: 100 };

        // Set the x and y scales
        const x = d3.scaleBand()
            .range([0, width - margin.left - margin.right])
            .padding(0.1)
            .domain(barData.map(function(d) { return d.label; }));

        const y = d3.scaleLinear()
            .range([height - margin.top - margin.bottom, 0])
            .domain([0, d3.max(barData, function(d) { return d.value; })]);

        // Create the SVG container
        const svg = d3.select("#chart-container")
            .html('') // Clear previous chart
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add the bars to the bar chart
        svg.selectAll(".bar")
            .data(barData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.label); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - margin.top - margin.bottom - y(d.value); })
            .attr("fill", "#69b3a2");

        // Add x-axis with rotated labels
        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("transform", "rotate(-40)")  // Rotate x-axis labels to avoid overlap
            .attr("dx", "-0.5em")  // Adjust label position
            .attr("dy", "1em");  // Adjust y-axis label position

        // Add y-axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add labels to the bars (optional)
        svg.selectAll(".text")
            .data(barData)
            .enter().append("text")
            .attr("class", "text")
            .attr("x", function(d) { return x(d.label) + x.bandwidth() / 2; })
            .attr("y", function(d) { return y(d.value) - 5; })
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(function(d) { return d.value; });
    }

    // Initial render without any filtering (shows all data)
    renderBarChart(data);

    // Event listener for the year filter
    document.getElementById("year-filter").addEventListener("change", function(event) {
        const selectedYear = event.target.value;

        // Filter data based on the selected year
        const filteredData = selectedYear 
            ? data.filter(d => d['release_year'] == selectedYear) 
            : data;

        // Render the chart with the filtered data
        renderBarChart(filteredData);
    });

}).catch(function(error) {
    console.error("Error loading the CSV file:", error);
});