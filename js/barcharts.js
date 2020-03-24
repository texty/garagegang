/**
 * Created by yevheniia on 13.03.20.
 */
var drawBars = function (multiplenest, yCount) {

    const color = d3.scaleOrdinal()
        .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний","Економічний"])
        .range(["#5CE577", "#4A80FF", "#EAEDA0", "#EB6AC2", "purple"]);

    const formatValue = d3.format(".2s");

    const margin = {top: 0, right: 0, bottom: 0, left: 80};
    const chart_height = 300;
    const chart_width = 150;

    //console.log("---------");

    const x = d3.scaleBand()
        .range([0, chart_width])
        .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний","Економічний"])
        .padding(0.3);

    function chart(selection) {
        selection.each(function (data) {

            var AllValues = [];

            var G = d3.select(this);


            //успішні
            const succsess = data.filter(function(c) {
                return c.key === "Успішний"});

            //неуспішні
            const unsuccsess = data.filter(function(c) {
                return c.key === "Неуспішний"
            });

            //заг. сума для конкретного графіка, її будемо рахувати за 100%;
            var totalAmount = 0;

            //максимальне значення для y domain
            var maxValue = 0;


            succsess[0].values.forEach(function(d){
                AllValues.push(d);
                totalAmount = totalAmount + +d.value;
                maxValue = +d.value > maxValue ? +d.value: maxValue;
           });

            unsuccsess[0].values.forEach(function(d){
                d.value = -Math.abs(d.value);

                AllValues.push(d);
                totalAmount = totalAmount + +d.value;
                maxValue = +d.value > maxValue ? +d.value: maxValue;
            });


            var max = d3.max(AllValues, function(d){ return d.value });

            var y = d3.scaleLinear()
                .domain([-max, max])
                .range([chart_height, 0]);

            const y_pos = d3.scaleLinear()
                .domain([0, max])
                .range([chart_height/2, 0]);

            const y_neg = d3.scaleLinear()
                .domain([-max, 0])
                .range([chart_height, chart_height/2]);

           const positive_bars = G
                .append("g")
                .attr("transform", "translate(0,0)")
                .selectAll(".positive-bar")
                .data(AllValues);

           positive_bars.enter()
                .append("rect")
                .attr("class", "positive-bar")
                .attr("width", x.bandwidth())
                .attr("x", function(d) {
                    return x(d.key)
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("fill", function(d) {
                    return color(d.key)
                })

                .attr('y', y(0))
                .on("click", function(k){
                   console.log(k.value );
                })
                .transition()
                .duration(500)
                .attr("y",function(k){
                    console.log(k);
                    if(k.value < 0){
                        return y(0) + 5;
                    }
                    else {
                        return y(k.value);
                    }
                })
                .attr("height", function(k){
                        return chart_height/2 - y(Math.abs(k.value));
                });


           const yaxis = G
                .append("g")
                .attr("transform", "translate(-10,0)")
                .call(d3.axisRight(y_pos));

            yaxis.append("text")
                   .attr("x", -10)
                   .attr("y", -10)
                   .attr("dy", "0")
                   .attr("text-anchor", "start")
                   .style("font-size", "1.1em")
                   .style("fill", "#1381B5")
                   .text( yCount === "engaged_number"? max : formatValue(max));



            if(multiplenest === "platform") {
                G
                    .append("g")
                    .attr("transform", "translate(-10,10)")
                    .call(d3.axisRight(y_neg));

            }




           

        });

    }
    return chart;

};