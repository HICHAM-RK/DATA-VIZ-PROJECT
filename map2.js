Promise.all([
    d3.json("world_map.json"),
    d3.csv("netflix_titles.csv")
]).then(function([worldData, netflixData]) {

    // Process Netflix data to count movies and TV shows by country
    const countryCount = d3.rollup(netflixData, v => {
        return {
            movies: v.filter(d => d.type === 'Movie').length,
            tvShows: v.filter(d => d.type === 'TV Show').length
        };
    }, d => d.country);

    // Set up the map projection and path
    const projection = d3.geoMercator().scale(120).translate([480, 300]);
    const path = d3.geoPath().projection(projection);

    // Set up the SVG canvas
    const svg = d3.select("#map").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    // Set up the tooltip
    const tooltip = d3.select("#tooltip");

    // Draw the map
    svg.selectAll("path")
        .data(worldData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            const countryName = d.properties.name;
            const counts = countryCount.get(countryName);

            // Show the tooltip
            if (counts) {
                tooltip.style("visibility", "visible")
                    .html(`${countryName}<br>Movies: ${counts.movies}<br>TV Shows: ${counts.tvShows}`);
            }
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY + 5) + "px")
                .style("left", (event.pageX + 5) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    // Color countries based on movie and TV show counts
    svg.selectAll("path")
        .attr("fill", function(d) {
            const countryName = d.properties.name;
            const counts = countryCount.get(countryName);
            return counts ? d3.scaleLinear().domain([0, 10]).range(["#fff", "#ff7f0e"])(counts.movies + counts.tvShows) : "#ccc";
        });
});