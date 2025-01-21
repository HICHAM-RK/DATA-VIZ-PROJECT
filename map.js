// Set the dimensions of the map container
const cp_width = document.getElementById("netflix_map").clientWidth;
const cp_height = document.getElementById("netflix_map").clientHeight;

// Append the SVG container to the map div
const svg = d3.select("#netflix_map")
  .append("svg")
  .attr("class", "netflix_map")
  .attr("width", cp_width)
  .attr("height", cp_height);

// Load the Netflix data and world map data
Promise.all([
    d3.dsv(";", "netflix_titles.csv"), // Ensure the correct path to the CSV file
    d3.json("world_map.json")      // Ensure the correct path to the JSON file
]).then(([netflixData, worldMap]) => {
  console.log("Netflix Data:", netflixData); // Debug log
  console.log("World Map Data:", worldMap); // Debug log
  
  // Map projection setup
  const projection = d3.geoMercator()
    .scale(150)
    .translate([cp_width / 2, cp_height / 2]);

  const path = d3.geoPath().projection(projection);

  // Append the map paths for each country
  const mapGroup = svg.append("g");

  mapGroup
    .selectAll("path")
    .data(worldMap.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "lightgray") // Default color for countries with no data
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);


// Function to count Netflix titles per country
function countTitlesByCountry(data, year) {
    const countryData = {};
    data.forEach(d => {
      if (d.country && (!year || d.release_year == year)) {
        const countries = d.country.split(",");  // Some titles are available in multiple countries
        countries.forEach(country => {
          country = country.trim();
          if (countryData[country]) {
            countryData[country]++;
          } else {
            countryData[country] = 1;
          }
        });
      }
    });
    return countryData;
  }
  
  // Get the country data for the selected year
  const countryData = countTitlesByCountry(netflixData, "");
  
  // Define the color scale
  const maxCount = d3.max(Object.values(countryData));  // Max number of titles for any country
  const minCount = 1;  // Ensure we start from 1 to avoid color clash with 0 titles
  
  // Use logarithmic scale to give more visual distinction for smaller counts
  const colorScale = d3.scaleLog()
    .base(10)
    .domain([minCount, maxCount])
    .range([d3.rgb("#ffe5e5"), d3.rgb("#8b0000")]); // From light red to dark red
  
  // Function to update the map based on the selected year
  function updateMap(year) {
    // Get country data filtered by the selected year
    const countryData = countTitlesByCountry(netflixData, year);
  
    // Color countries based on Netflix data
    mapGroup
      .selectAll("path")
      .attr("fill", d => {
        const countryName = d.properties.name;
        const titleCount = countryData[countryName] || 0;
  
        // If no titles, color gray, else use the color scale
        return titleCount === 0 ? "#d3d3d3" : colorScale(titleCount);
      });
  
    // Add tooltips
    const tooltip = d3.select("#netflix_map")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid black")
      .style("border-radius", "5px");
  
    mapGroup
      .selectAll("path")
      .on("mouseover", function (event, d) {
        const countryName = d.properties.name;
        const netflixCount = countryData[countryName] || 0;
  
        tooltip.html(`<strong>${countryName}</strong><br>Titles: ${netflixCount}`)
          .style("visibility", "visible");
  
        d3.select(this).attr("fill", "orange"); // Change color on hover
      })
      .on("mousemove", event => {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("fill", d => {
          const countryName = d.properties.name;
          return countryData[countryName] ? colorScale(countryData[countryName]) : "#d3d3d3"; // Neutral gray for countries with 0 titles
        });
      });
  }
  
  // Add legend for color scale
  const legend = d3.select("#netflix_map_legend")
    .append("svg")
    .attr("width", 150)
    .attr("height", 300);
  
  const legendScale = d3.scaleLog()
    .base(10)
    .domain([minCount, maxCount])
    .range([250, 0]);
  
  const legendAxis = d3.axisRight(legendScale).ticks(5);
  
  const gradient = legend.append("defs")
    .append("linearGradient")
    .attr("id", "legendGradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "0%");
  
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.rgb("#ffe5e5"));
  
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.rgb("#8b0000"));
  
  legend.append("rect")
    .attr("x", 10)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 250)
    .style("fill", "url(#legendGradient)");
  
  legend.append("g")
    .attr("transform", "translate(30,0)")
    .call(legendAxis);
  
  // Initial update (no filter)
  updateMap("");
  
  // Add event listener to the year filter
  const yearFilter = document.getElementById("year-filter");
  yearFilter.addEventListener("change", function() {
    updateMap(this.value);
  });
  







  // Zoom functionality
  const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Limit zoom scale to between 1x and 8x
    .on("zoom", function(event) {
      mapGroup.attr("transform", event.transform);
    });

  // Apply zoom behavior to the SVG
  svg.call(zoom);

}).catch(err => {
  console.error("Error loading data:", err);
});
