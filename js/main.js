/**
 * Created by yevheniia on 13.03.20.
 */


d3.csv("data/data.csv").then(function(data){
    const craudf = data.filter(function(d){ return d.platform_type != "Громадський бюджет"});
    const budget = data.filter(function(d){ return d.platform_type === "Громадський бюджет"});


    //обраний тип платформи
    var currentData = craudf;

    //обрані роки
    var startYear = '2016', endYear = '2019';

    //голоси чи гроші
    var yCount = "engaged_number";

    var mySlider = new rSlider({
        target: '#slider',
        values: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        range: true,
        set: [2016, 2019],
        width:    null,
        scale:    true,
        labels:   true,
        tooltip:  false,
        step:     1,
        disabled: false,
        onChange: function (vals) {
            startYear = vals.split(",")[0];
            endYear = vals.split(",")[1];
            draw(currentData, startYear, endYear, yCount);
        }
    });


    //draw(craudf, startYear, endYear, yCount);

    d3.selectAll("#budget").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#craudf").classed("active", false);
        currentData = budget;
        draw(currentData, startYear, endYear, yCount);
    });

    d3.selectAll("#craudf").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#budget").classed("active", false);
        currentData = craudf;
        draw(currentData, startYear, endYear, yCount);
    });

    d3.selectAll("#money").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#voices").classed("active", false);
        yCount = "collected_amount";
        draw(currentData, startYear, endYear, yCount);
    });

    d3.selectAll("#voices").on("click", function(e){
        d3.select(this).classed("active", true);
        d3.select("#money").classed("active", false);
        yCount = "engaged_number";
        draw(currentData, startYear, endYear, yCount);
    });



});



const width = window.innerWidth >= 1200 ? 1200: window.innerWidth * 0.9;

const columns = Math.floor(width/300);






//
// const y = d3.scaleLinear()
//     .domain([-200, 200])
//     .range([150, 0]);
//
// const x = d3.scaleBand()
//     .range([0, 150])
//     .padding(0.3);


var draw = function(df, yearStart, yearEnd, yCount){

    d3.selectAll("#chart svg").remove();

    var multiplenest;
    var filtered;

    if(df[0].platform_type === "Краудфандинг"){
        multiplenest = "platform";
        filtered = df.filter(function(d) {
            return +d.any_date >= yearStart && +d.any_date <= yearEnd
        });
        
    } else {
        multiplenest = "location";
        filtered = df.filter(function(d) {
            return +d.any_date >= yearStart && +d.any_date <= yearEnd && d.status === "Успішний"
        });
    }


    var nested = d3.nest()
        .key(function(d) { return d[multiplenest]; })
        .key(function(d) { return d.status; })
        .key(function(d) { return d.capital; })
        .rollup(function(v) {
            return d3.sum(v, function (d) {
                return +d[yCount];
            })
        })
        .entries(filtered);

        console.log(nested.length);

    const height = nested.length / columns * 350;


    const container =  d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    /* якщо немає успішного чи неуспішного, не малюються бари, додаємо відсутній*/
    nested.forEach(function(d){
        if(d.values.length < 2 && d.values[0].key === "Успішний") {
            d.values.push({key: "Неуспішний", values: []})
        }
    });


    const multiple = container.selectAll("g")
        .data(nested).enter()
        .append("g")
        .attr("class", "multiple")
        .attr("transform", function(d, i){
           var xshift = (i % columns) * 300;
           var yshift = ~~(i / columns) * 400;
           return "translate(" + xshift + "," + yshift + ")"} );


    multiple
        .append("text")
        .text(function(d){ return d.key })
        .attr("y", 15)
        .attr("x", 70)
        .attr("fill", "white")
        .style("text-anchor", "middle");


    const bars = multiple
        .append('g')
        .attr("transform", "translate(" + 0 + "," + 30 + ")")
        .datum(function (d) {
            return d.values
         })
        .call(
            drawBars()
        );

    // const positive_bars = bars.append("g")
    //     .attr("class", "positive")
    //     .data(function (d) {
    //         return d.key === "Успішний"
    //     });
    //
    //
    // const negative_bars = bars.append("g")
    //     .attr("class", "negative")
    //     .datum(function (d) {
    //         return d.key === "Неуспішний"
    //     });
    //
    //     positive_bars
    //         //.enter()
    //         .append("rect")
    //         .attr("class", "positive-bar")
    //         .attr("width", x.bandwidth())
    //         .attr("x", function(d) {
    //             return x(d.key)
    //         })
    //         .attr("rx", 6)
    //         .attr("ry", 6)
    //         .attr("fill", function(d) {
    //             return color(d.key) })
    //         .attr("y", chartheight)
    //         .transition()
    //         .duration(500)
    //         .attr('y', function(k) {
    //
    //             return y(k.values.length);
    //         })
    //         .attr('height', function(k,i){ return chartheight - y(k.values.length); });
    //
    //
    //     negative_bars
    //         //.enter()
    //         .append("rect")
    //         .attr("class", "negative-bar")
    //         .attr("width", x.bandwidth())
    //         .attr("x", function(d) {
    //             return x(d.key)
    //         })
    //         .attr("rx", 6)
    //         .attr("ry", 6)
    //         .attr("fill", function(d) { return color(d.key) })
    //         .attr("y", chartheight)
    //         .transition()
    //         .duration(500)
    //         .attr('y', chartheight + 20 )
    //         .attr('height', function(k,i){ return chartheight - y(k.values.length); });
    //
    //
    //
    //     positive_bars.exit().remove();
    //     negative_bars.exit().remove();



    console.log("---------");


};


