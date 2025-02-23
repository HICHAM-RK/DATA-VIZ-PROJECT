// Load the dataset with semicolon delimiter (since your data uses semicolons)
d3.dsv(";", "netflix_titles.csv").then(function(data) {
    // Extract the unique years for the year filter
    const yearSelect = d3.select("#year-filter");

    // Extract unique years from the data and sort them
    const uniqueYears = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
    
    // Populate the dropdown with sorted years
    yearSelect.selectAll("option")
        .data(uniqueYears)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
    // Filter the data based on the selected year
    function filterDataByYear(year) {
        return data.filter(d => new Date(d.release_year).getFullYear() === year);
    }

    // Function to update charts based on filtered data
    function updateVisualizations(filteredData) {
        // Clear the previous visualizations
        d3.select("#visualization-container").html("");

        // First chart - Movie and TV Show Distribution
        const contentCounts = {
            Movie: 0,
            "TV Show": 0
        };

        filteredData.forEach(function(d) {
            const type = d.type ? d.type.trim() : "";
            if (type === "Movie") {
                contentCounts.Movie++;
            } else if (type === "TV Show") {
                contentCounts["TV Show"]++;
            }
        });

        const total = contentCounts.Movie + contentCounts["TV Show"];
        const contentPercentages = {
            Movie: (contentCounts.Movie / total) * 100,
            "TV Show": (contentCounts["TV Show"] / total) * 100
        };

        const margin = {top: 20, right: 20, bottom: 40, left: 60};
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#visualization-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleBand()
            .domain(Object.keys(contentCounts))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(Object.values(contentCounts))])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .selectAll(".x-axis")
            .data(Object.keys(contentCounts))
            .enter().append("g")
            .attr("class", "x-axis")
            .attr("transform", function(d, i) {
                return "translate(" + x(d) + ",0)";
            })
            .each(function(d) {
                d3.select(this).append("text")
                    .attr("x", x.bandwidth() / 2)
                    .attr("y", height + 20)
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(d);
            });

        svg.append("g")
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 1) 
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Distribution of Movies and TV Shows");
                
        // Tooltip functionality
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("pointer-events", "none"); // Ensure the tooltip doesn't interfere with mouse events

        svg.selectAll(".bar")
            .data(Object.entries(contentCounts))
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d[0]); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return height - y(d[1]); })
            .attr("fill", function(d) {
                return d[0] === "Movie" ? "red" : "black";
            })
            .attr("stroke", "#333")
            .attr("stroke-width", 2)
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .text(d[0] + ": " + d[1] + " (" + d3.format(".1f")(contentPercentages[d[0]]) + "%)");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY + 5) + "px")
                    .style("left", (event.pageX + 5) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        svg.selectAll(".percentage")
            .data(Object.entries(contentCounts))
            .enter().append("text")
            .attr("class", "percentage")
            .attr("x", function(d) { return x(d[0]) + x.bandwidth() / 2; })
            .attr("y", function(d) { return y(d[1]) + (height - y(d[1])) / 2; })
            .attr("dy", ".35em")
            .style("fill", "black")
            .style("font-size", "14px")
            .style("text-anchor", "middle")
            .text(function(d) { 
                return d3.format(".1f")(contentPercentages[d[0]]) + "%"; 
            });
// Tooltip element
    const tooltip2 = d3.select("#line-chart-container")
    
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("font-size", "12px");

        // Second chart - Genre Distribution
        const genreCounts = {};

        filteredData.forEach(function(d) {
            if (d["listed_in"]) {
                const genres = d["listed_in"].split(",");
                genres.forEach(function(genre) {
                    genre = genre.trim();
                    if (genreCounts[genre]) {
                        genreCounts[genre]++;
                    } else {    
                        genreCounts[genre] = 1;
                    }
                });
            }
        });
        const sortedGenreCounts = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

        const margin2 = {top: 20, right: 38, bottom: 60, left: 150};
        const width2 = 800 - margin2.left - margin2.right;
        const height2 = 600 - margin2.top - margin2.bottom;

        const svg2 = d3.select("#visualization-container")
            .append("svg")
            .attr("width", width2 + margin2.left + margin2.right)
            .attr("height", height2 + margin2.top + margin2.bottom)
            .append("g")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

                
        const x2 = d3.scaleLinear()
            .domain([0, d3.max(sortedGenreCounts, d => d[1])])
            .nice()
            .range([0, width2]);

        const y2 = d3.scaleBand()
            .domain(sortedGenreCounts.map(d => d[0]))
            .range([0, height2])
            .padding(0.1);


// Genre Tooltip element
const genreTooltip = d3.select("body")
    .append("div")
    .attr("id", "genreTooltip")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "#f9f9f9")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("pointer-events", "none")
    .style("z-index", "10")
    .style("font-size", "12px")
    .style("color", "black")
    .style("border-radius", "4px")
    .style("box-shadow", "0px 2px 4px rgba(0, 0, 0, 0.2)");





        svg2.append("g")
            .attr("transform", "translate(0," + height2 + ")")
            .call(d3.axisBottom(x2));

        svg2.append("g")
            .call(d3.axisLeft(y2));
        svg2.append("text")
            .attr("x", width2 / 2)
            .attr("y", -7) 
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Distribution of Content by Genre");
        
// Bars with tooltip
svg2.selectAll(".bar")
    .data(sortedGenreCounts)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", function(d) { return y2(d[0]); })
    .attr("width", function(d) { return x2(d[1]); })
    .attr("height", y2.bandwidth())
    .attr("fill", "#4CAF50")
    .attr("stroke", "#333")
    .attr("stroke-width", 2)
    .on("mouseover", function(event, d) {
        genreTooltip.style("display", "block")
            .html(`<strong>${d[0]}</strong>: ${d[1]} movies`);
        d3.select(this).attr("fill", "#45A049"); // Highlight bar
    })
    .on("mousemove", function(event) {
        genreTooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function() {
        genreTooltip.style("display", "none");
        d3.select(this).attr("fill", "#4CAF50"); // Reset bar color
    });
            
// Percentage labels
const sumgen = d3.sum(sortedGenreCounts, d => d[1]);
svg2.selectAll(".percentage")
    .data(sortedGenreCounts)
    .enter().append("text")
    .attr("class", "percentage")
    .attr("x", function(d) { return x2(d[1]) + 10; })
    .attr("y", function(d) { return y2(d[0]) + y2.bandwidth() / 2; })
    .attr("dy", ".35em")
    .style("fill", "black")
    .style("font-size", "14px")
    .style("text-anchor", "start")
    .text(function(d) { return d3.format(".1f")(d[1] / sumgen * 100) + "%"; });
        // Animate bar update for year change
        svg.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return height - y(d[1]); });
    }
// Line chart showing the count of movies and TV shows released by year
function updateLineChart(data) {
    // Prepare the data for the line chart
    const yearlyCounts = {};

    data.forEach(function(d) {
        const year = new Date(d.release_year).getFullYear();
        const type = d.type ? d.type.trim() : "";

        if (!yearlyCounts[year]) {
            yearlyCounts[year] = { year: year, Movie: 0, "TV Show": 0 };
        }

        if (type === "Movie") {
            yearlyCounts[year].Movie++;
        } else if (type === "TV Show") {
            yearlyCounts[year]["TV Show"]++;
        }
        
    });

    // Sort years to ensure the line chart is displayed correctly
    const sortedData = Object.values(yearlyCounts).sort((a, b) => a.year - b.year);

    // Define chart dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear the previous line chart
    d3.select("#line-chart-container").html("");

    const svg = d3.select("#line-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

// Add the chart title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", -8) // Adjust this value for positioning
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Release Year vs. Content Type");        
    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(sortedData, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => Math.max(d.Movie, d["TV Show"]))])
        .nice()
        .range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.Movie));

    const lineTVShow = d3.line()
        .x(d => x(d.year))
        .y(d => y(d["TV Show"]));

    // Line for movies
    svg.append("path")
        .datum(sortedData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Line for TV shows
    svg.append("path")
        .datum(sortedData)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", lineTVShow);

    // Add points for movies
// Add points for movies with tooltip
svg.selectAll(".dot-movie")
    .data(sortedData)
    .enter().append("circle")
    .attr("class", "dot-movie")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.Movie))
    .attr("r", 4)
    .attr("fill", "red")
    .on("mouseover", function (event, d) {
        tooltip2.style("visibility", "visible")
            .text(`Year: ${d.year}, Movies: ${d.Movie}`);
    })
    .on("mousemove", function (event) {
        tooltip2.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
        tooltip2.style("visibility", "hidden");
    });


    // Add points for TV shows
// Add points for TV shows with tooltip
svg.selectAll(".dot-tvshow")
    .data(sortedData)
    .enter().append("circle")
    .attr("class", "dot-tvshow")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d["TV Show"]))
    .attr("r", 4)
    .attr("fill", "blue")
    .on("mouseover", function (event, d) {
        tooltip2.style("visibility", "visible")
            .text(`Year: ${d.year}, TV Shows: ${d["TV Show"]}`);
    })
    .on("mousemove", function (event) {
        tooltip2.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
        tooltip2.style("visibility", "hidden");
    });

    // Add labels for axes
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("font-size", "14px")
        .text("Year");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .style("font-size", "14px")
        .text("Count");
        

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150},${20})`);

    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "red");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .style("font-size", "12px")
        .text("Movies");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "blue");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .style("font-size", "12px")
        .text("TV Shows");
}

// Add a container for the line chart in your HTML


// Call the line chart function with the filtered data
updateLineChart(data);

    // Initial update with all data
    updateVisualizations(data);

    // Update visualizations when a year is selected
    yearSelect.on("change", function() {
        const selectedYear = +this.value;
        const filteredData = filterDataByYear(selectedYear);
        updateVisualizations(filteredData);
    });

})

.catch(function(error) {
    console.error("Error loading the CSV file:", error);
});
