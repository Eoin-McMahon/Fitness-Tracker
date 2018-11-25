$(document).ready(function(){

   $("#elevChart").hide();

   $("#heartButton").click(function(){
     $("#elevChart").hide();
     $("#heartChart").show();
   });

   $("#elevButton").click(function(){
     $("#heartChart").hide();
     $("#elevChart").show();
   });

  $.ajax({
    type: "GET",
    url: "/assets/Lugano.gpx",
    dataType: "xml",
    success: function(xml){

    var times = [];
    var elevations = [];
    var points = [];

    //aquires name and type of each activity
    $(xml).find('trk').each(function(){
      console.log("Finding name and type...");
      var name = $(this).find('name').text();
      var type = $(this).find('type').text();
      $('#filename').text(name + " - " + type);

    });

    //body stats
    var numTrkpts = 0;
    var heartRateSum = 0;
    var cadSum = 0;
    var maxHR = 0;
    var minHR = 0;

    //distance Stats
    var lats = [];
    var lons = [];
    var heartrates = []
    console.log("Aquiring Stats...");

    //Aquires the appropriate stats from each trkpt
    $(xml).find('trkpt').each(function(){
      times.push($(this).find('time').text());
      lats.push($(this).attr('lat'));
      lons.push($(this).attr('lon'));
      elevations.push($(this).find('ele').text());

      var hr = $(this).find('ns3\\:hr').text();
      heartrates.push(hr);
      //calculates maxHR
      if(parseInt(hr) > maxHR){
         maxHR = parseInt(hr);
      }

      //calculates minHR
      if((parseInt(hr) < minHR) || minHR == 0){
         minHR = parseInt(hr);
      }

      //heartRateSum and cadSum used for avgs
      heartRateSum += parseInt(hr);
      cadSum += parseInt($(this).find('ns3\\:cad').text());
      numTrkpts++;
    });

    //time stats
    var startTime = new Date(times[0]);
    var endTime = new Date(times[numTrkpts-1]);
    var res = Math.abs(endTime - startTime) / 1000;
    var hours = Math.floor(res / 3600) % 24;
    var minutes = Math.floor(res / 60) % 60;
    var seconds = res % 60;

    //extra time stats, probs wont be used
    var year = startTime[0]+startTime[1]+startTime[2]+startTime[3];
    var month = startTime[5]+startTime[6];
    var day = startTime[8]+startTime[9];

    //distance stats
    var totalDis = 0;
    var radius = 6371;
    //function used to caculate totalDis
    for(var i=0; i<lats.length; i++ ){
      if(i != (lats.length - 1)){
         var dLat = (lats[i+1] - lats[i]) * (3.14159265359/180);
         var dLon = (lons[i+1] - lons[i]) * (3.14159265359/180);

         var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos((lats[i]) * (3.14159265359/180)) * Math.cos((lats[i+1]) * (3.14159265359/180)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);

         var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
         totalDis += (radius * c);
      }
   }

    //outputting on console
    console.log("Min HR: " + minHR);
    console.log("Trkpts: " + numTrkpts);
    // console.log("Elevations: " + elevations);
    console.log("Start: " + startTime);
    console.log("End: " + endTime);
    console.log("Hours: " + hours);
    console.log("Minutes: " + minutes);
    console.log("Seconds: " + seconds);
    // console.log("Lats: " + lats);
    // console.log("Lons: " + lons)
    console.log("Total Distance: " + totalDis);
    // console.log(hours);
    var avgHeartRate = heartRateSum / numTrkpts;
    var avgCad = cadSum / numTrkpts;
    console.log("Avg HeartRates: " + Math.round(avgHeartRate));
    console.log("Avg Cad: " + Math.round(avgCad));
    console.log("Points: " + points);

    //updating html variables
    $('#avgHR').text(Math.round(avgHeartRate) + " BPM");
    $('#avgCad').text(Math.round(avgCad) + " SPM");
    $('#maxHr').text("Max Heartrate(BPM):  " + maxHR);
    $('#minHr').text("Min Heartrate(BPM):  " + minHR);
    $('#tt').text("Time Taken: " + hours + " hours " + minutes + " minutes and " + seconds + " seconds");
    $('#disRan').text("Distance Run(km): " + totalDis.toFixed(2));
    createChart(numTrkpts, heartrates, "Heartrate on Run", 'heartChart', 'Distance Ran(KM)', 'Heartrate(BPM)');
    createChart(numTrkpts, elevations, "Elevations on Run", 'elevChart', 'Distance Ran(KM)', 'Elevation');
  },
  error: function() {
    alert("An error occurred while processing XML file.");
  }
  });


});

function createChart(numTrkpts, data, chartTitle, div, x, y){
   console.log("Creating Chart...")
   var x_axis = [];

   for(var i=0; i<numTrkpts; i++){
      x_axis.push(i/100);
   }

   console.log("X_Axis: " + x_axis);

   var trace = {
      x: x_axis,
      y: data,
      mode: 'lines',
      type: 'scatter'
   };
   var data = [trace];
   var layout = {
      xaxis: {
          title: x,
          titlefont: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
     yaxis: {
       title: y,
       titlefont: {
         family: 'Courier New, monospace',
         size: 18,
         color: '#7f7f7f'
       }
    },
      title: chartTitle
   };
   console.log("Plotting...");
   Plotly.newPlot(div, data, layout);

}
