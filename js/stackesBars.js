const color = d3.scaleOrdinal()
    .domain(["Культурний", "Соціальний","Людський", "Інфраструктурний"])
    .range(["#5CE577", "#4A80FF", "#EAEDA0", "#EB6AC2"]);


var platform_type = $("#platform_type").children("option:selected").val();
var value_type = $("#value_type").children("option:selected").val();
var status_type = $("#status_type").children("option:selected").val();
var percents_or_absolutes = $("#percents_or_absolutes").children("option:selected").val();
var platform_or_location = platform_type === "Краудфандинг" ? "platform" : "location";;



d3.csv("data/data.csv").then(function(csv){
    var platform_list  = [...new Set(csv.filter(function(d){
            return d.platform_type === "Краудфандинг" && d.status  === "Успішний"}).map(function(d) { return d["platform"] }))];

    var location_list =   [...new Set(csv.filter(function(d){
            return d.platform_type != "Краудфандинг" && d.status  === "Успішний"}).map(function(d) { return d["location"] }))];


    let default_data = csv.filter(function(d){
        return d.platform_type === "Краудфандинг" &&  d.status === "Успішний" && d.capital != "Економічний";
    });

    //коли міняємо значення в загу, перевизначаємо змінні
    $('.heading-select').on('change', function() {
        platform_type = $("#platform_type").children("option:selected").val();
        value_type = $("#value_type").children("option:selected").val();
        status_type = $("#status_type").children("option:selected").val();
        percents_or_absolutes = $("#percents_or_absolutes").children("option:selected").val();
        platform_or_location = platform_type === "Краудфандинг" ? "platform" : "location";
        if(platform_type === "location") {
            $("#status_type").css("display", "none");
            status_type = "Успішний"
        } else {
            $("#status_type").css("display", "inline-block");
        }

        let dataData = csv.filter(function(d){
            return d.platform_type === platform_type &&  d.status === status_type && d.capital != "Економічний";
        });


        chart(dataData, value_type, percents_or_absolutes, platform_or_location);
    });

    const formatValue = d3.format(".2s");

    chart(default_data, value_type, percents_or_absolutes, platform_or_location);


    //намалювати обрані міста/платформи
    $("button#checked-platforms").click(function(){
        var favorite = [];
        $.each($("input[name='platform']:checked"), function(){
            favorite.push($(this).val());
            $(this).prop( "checked", false );
        });

        $("#checkboxes").css("display", "none");

        let selected_data = csv.filter(function(d){
            return d.platform_type === selected_platform &&  d.status === status_type && d.capital != "Економічний" && favorite.includes(d[selected_platform])
        });

        chart(selected_data, value_type, percents_or_absolutes, selected_platform);
        console.log("My favourite sports are: " + favorite.join(", "));
    });


    //додати опіції в селект -міняємо при переключенні між краудфандінгом і громадсбким бюджетом
    change_sekectList("platform");

    $("#platform_type").change(function() {
        change_sekectList(platform_or_location)
    });

    function change_sekectList(value) {
        d3.selectAll("#checkboxes label").remove();
        var select = d3.select("#checkboxes");

        var options = select.selectAll("label")
            .data(value == "platform" ? platform_list : location_list);

        options
            .enter()
            .insert("label", "button")
            .html(function (d) {
                return "<input name='platform' type='checkbox' id='one' value='" + d + "' />" + d + "</label>"
            });
    }
});



function chart(data, xValue, scale, yVal) {

    var platforms  = [...new Set(data.map(function(d) { return d[yVal] }))];
    var capitals  = [...new Set(data.map(function(d) { return d.capital }))];
    var all_amounts = [];
    var df = [];


    platforms.forEach(function(platform){
        var cap_df = [];
        capitals.forEach(function(capital){
            var filtered = data.filter(function(d){
                return d[yVal] === platform && d.capital === capital });

            var amount = filtered.reduce(function(a, b) {
                return a + +b[xValue];
            }, 0);

            var ob = { "capital": capital, "amount": amount };
            cap_df.push(ob);
        });

        var total = cap_df.reduce(function(a, b) {
            return a + +b["amount"];
        }, 0);


        var row;
        if(scale === "percents"){
                row = { "platform": platform,
                [cap_df[0].capital]: cap_df[0].amount / (total/100),
                [cap_df[1].capital]: cap_df[1].amount / (total/100),
                [cap_df[2].capital]: cap_df[2].amount / (total/100),
                [cap_df[3].capital]: cap_df[3].amount / (total/100)
            };

            all_amounts.push(100);
        } else {
            row = {
                "platform": platform,
                [cap_df[0].capital]: cap_df[0].amount,
                [cap_df[1].capital]: cap_df[1].amount,
                [cap_df[2].capital]: cap_df[2].amount,
                [cap_df[3].capital]: cap_df[3].amount
            };
            all_amounts.push(total);
        }

        df.push(row);
    });



    var subgroups = ["Культурний", "Соціальний", "Людський", "Інфраструктурний"];

    var svg = d3.select("#chart"),
        margin = {top: 50, left: 150, bottom: 50, right: 0},
        width = +svg.attr("width") - margin.left - margin.right,
        height = (platforms.length * 30) + margin.bottom;

    svg.attr("height", height);

    //height = +svg.attr("height") - margin.top - margin.bottom;

    var y = d3.scaleBand()
        .rangeRound([0, height - margin.bottom])
        .paddingInner(0.2);

    var x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);

    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .attr("class", "x-axis");

    var yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis");

    var groups = d3.map(df, function (d) {
            return (d.platform)
        }).keys();

    y.domain(groups);

    svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y));


    if (scale === "abs") {
        x.domain([0, d3.max(all_amounts, function (d) {
            return d;
        })])
    } else {
        x.domain([0, 100])
    }

    svg.select(".x-axis")
        .transition()
        .duration(500)
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")));

    var stackedData = d3.stack()
        .keys(subgroups)
        (df);

    var group = svg.selectAll("g.layer")
        .data(stackedData);


    group.exit().remove();

    group.enter()
        .append("g")
        .classed("layer", true)
        .attr("fill", function (d) {
            return color(d.key)
        })
        .attr("capital", function (d) {
            return d.key
        });

    var bars = svg.selectAll("g.layer")
            .selectAll("rect")
            .data(function (d) {
                return d;
            });

    bars.exit().remove();

    bars.enter()
        .append("rect")
        .on("click", function (d) {
            let clicked_capital = d3.select(this.parentNode).attr("capital");
            console.log(d.data.platform);
            console.log(clicked_capital);
        })
        .attr("y", function (d) {
            return y(d.data.platform);
        })
        .attr("x", function (d) {
            return x(0);
        })

        .attr("height", y.bandwidth())
        .merge(bars)
        .transition().duration(500)

        .attr("y", function (d) {
            return y(d.data.platform);
        })
        .attr("x", function (d) {
            return x(d[0]);
        })
        .attr("width", function (d) {
            return x(d[1]) - x(d[0]);
        });






}