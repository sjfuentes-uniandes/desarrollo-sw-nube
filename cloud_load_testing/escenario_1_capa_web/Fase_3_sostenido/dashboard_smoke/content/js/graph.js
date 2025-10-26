/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
$(document).ready(function() {

    $(".click-title").mouseenter( function(    e){
        e.preventDefault();
        this.style.cursor="pointer";
    });
    $(".click-title").mousedown( function(event){
        event.preventDefault();
    });

    // Ugly code while this script is shared among several pages
    try{
        refreshHitsPerSecond(true);
    } catch(e){}
    try{
        refreshResponseTimeOverTime(true);
    } catch(e){}
    try{
        refreshResponseTimePercentiles();
    } catch(e){}
});


var responseTimePercentilesInfos = {
        data: {"result": {"minY": 5176.0, "minX": 0.0, "maxY": 111534.0, "series": [{"data": [[0.0, 5176.0], [0.1, 5176.0], [0.2, 5176.0], [0.3, 5176.0], [0.4, 5176.0], [0.5, 5176.0], [0.6, 5176.0], [0.7, 5176.0], [0.8, 5176.0], [0.9, 5176.0], [1.0, 5176.0], [1.1, 6581.0], [1.2, 6581.0], [1.3, 6581.0], [1.4, 6581.0], [1.5, 6581.0], [1.6, 6581.0], [1.7, 6581.0], [1.8, 6581.0], [1.9, 6581.0], [2.0, 6581.0], [2.1, 6581.0], [2.2, 9152.0], [2.3, 9152.0], [2.4, 9152.0], [2.5, 9152.0], [2.6, 9152.0], [2.7, 9152.0], [2.8, 9152.0], [2.9, 9152.0], [3.0, 9152.0], [3.1, 9152.0], [3.2, 9152.0], [3.3, 9968.0], [3.4, 9968.0], [3.5, 9968.0], [3.6, 9968.0], [3.7, 9968.0], [3.8, 9968.0], [3.9, 9968.0], [4.0, 9968.0], [4.1, 9968.0], [4.2, 9968.0], [4.3, 9968.0], [4.4, 21737.0], [4.5, 21737.0], [4.6, 21737.0], [4.7, 21737.0], [4.8, 21737.0], [4.9, 21737.0], [5.0, 21737.0], [5.1, 21737.0], [5.2, 21737.0], [5.3, 21737.0], [5.4, 63392.0], [5.5, 63392.0], [5.6, 63392.0], [5.7, 63392.0], [5.8, 63392.0], [5.9, 63392.0], [6.0, 63392.0], [6.1, 63392.0], [6.2, 63392.0], [6.3, 63392.0], [6.4, 63392.0], [6.5, 63466.0], [6.6, 63466.0], [6.7, 63466.0], [6.8, 63466.0], [6.9, 63466.0], [7.0, 63466.0], [7.1, 63466.0], [7.2, 63466.0], [7.3, 63466.0], [7.4, 63466.0], [7.5, 63466.0], [7.6, 63471.0], [7.7, 63471.0], [7.8, 63471.0], [7.9, 63471.0], [8.0, 63471.0], [8.1, 63471.0], [8.2, 63471.0], [8.3, 63471.0], [8.4, 63471.0], [8.5, 63471.0], [8.6, 63471.0], [8.7, 63677.0], [8.8, 63677.0], [8.9, 63677.0], [9.0, 63677.0], [9.1, 63677.0], [9.2, 63677.0], [9.3, 63677.0], [9.4, 63677.0], [9.5, 63677.0], [9.6, 63677.0], [9.7, 63713.0], [9.8, 63713.0], [9.9, 63713.0], [10.0, 63713.0], [10.1, 63713.0], [10.2, 63713.0], [10.3, 63713.0], [10.4, 63713.0], [10.5, 63713.0], [10.6, 63713.0], [10.7, 63713.0], [10.8, 64007.0], [10.9, 64007.0], [11.0, 64007.0], [11.1, 64007.0], [11.2, 64007.0], [11.3, 64007.0], [11.4, 64007.0], [11.5, 64007.0], [11.6, 64007.0], [11.7, 64007.0], [11.8, 64007.0], [11.9, 64120.0], [12.0, 64120.0], [12.1, 64120.0], [12.2, 64120.0], [12.3, 64120.0], [12.4, 64120.0], [12.5, 64120.0], [12.6, 64120.0], [12.7, 64120.0], [12.8, 64120.0], [12.9, 64120.0], [13.0, 64161.0], [13.1, 64161.0], [13.2, 64161.0], [13.3, 64161.0], [13.4, 64161.0], [13.5, 64161.0], [13.6, 64161.0], [13.7, 64161.0], [13.8, 64161.0], [13.9, 64161.0], [14.0, 64843.0], [14.1, 64843.0], [14.2, 64843.0], [14.3, 64843.0], [14.4, 64843.0], [14.5, 64843.0], [14.6, 64843.0], [14.7, 64843.0], [14.8, 64843.0], [14.9, 64843.0], [15.0, 64843.0], [15.1, 64994.0], [15.2, 64994.0], [15.3, 64994.0], [15.4, 64994.0], [15.5, 64994.0], [15.6, 64994.0], [15.7, 64994.0], [15.8, 64994.0], [15.9, 64994.0], [16.0, 64994.0], [16.1, 64994.0], [16.2, 65008.0], [16.3, 65008.0], [16.4, 65008.0], [16.5, 65008.0], [16.6, 65008.0], [16.7, 65008.0], [16.8, 65008.0], [16.9, 65008.0], [17.0, 65008.0], [17.1, 65008.0], [17.2, 65008.0], [17.3, 65015.0], [17.4, 65015.0], [17.5, 65015.0], [17.6, 65015.0], [17.7, 65015.0], [17.8, 65015.0], [17.9, 65015.0], [18.0, 65015.0], [18.1, 65015.0], [18.2, 65015.0], [18.3, 65179.0], [18.4, 65179.0], [18.5, 65179.0], [18.6, 65179.0], [18.7, 65179.0], [18.8, 65179.0], [18.9, 65179.0], [19.0, 65179.0], [19.1, 65179.0], [19.2, 65179.0], [19.3, 65179.0], [19.4, 66651.0], [19.5, 66651.0], [19.6, 66651.0], [19.7, 66651.0], [19.8, 66651.0], [19.9, 66651.0], [20.0, 66651.0], [20.1, 66651.0], [20.2, 66651.0], [20.3, 66651.0], [20.4, 66651.0], [20.5, 67387.0], [20.6, 67387.0], [20.7, 67387.0], [20.8, 67387.0], [20.9, 67387.0], [21.0, 67387.0], [21.1, 67387.0], [21.2, 67387.0], [21.3, 67387.0], [21.4, 67387.0], [21.5, 67387.0], [21.6, 68553.0], [21.7, 68553.0], [21.8, 68553.0], [21.9, 68553.0], [22.0, 68553.0], [22.1, 68553.0], [22.2, 68553.0], [22.3, 68553.0], [22.4, 68553.0], [22.5, 68553.0], [22.6, 68567.0], [22.7, 68567.0], [22.8, 68567.0], [22.9, 68567.0], [23.0, 68567.0], [23.1, 68567.0], [23.2, 68567.0], [23.3, 68567.0], [23.4, 68567.0], [23.5, 68567.0], [23.6, 68567.0], [23.7, 68634.0], [23.8, 68634.0], [23.9, 68634.0], [24.0, 68634.0], [24.1, 68634.0], [24.2, 68634.0], [24.3, 68634.0], [24.4, 68634.0], [24.5, 68634.0], [24.6, 68634.0], [24.7, 68634.0], [24.8, 69030.0], [24.9, 69030.0], [25.0, 69030.0], [25.1, 69030.0], [25.2, 69030.0], [25.3, 69030.0], [25.4, 69030.0], [25.5, 69030.0], [25.6, 69030.0], [25.7, 69030.0], [25.8, 69030.0], [25.9, 70667.0], [26.0, 70667.0], [26.1, 70667.0], [26.2, 70667.0], [26.3, 70667.0], [26.4, 70667.0], [26.5, 70667.0], [26.6, 70667.0], [26.7, 70667.0], [26.8, 70667.0], [26.9, 71699.0], [27.0, 71699.0], [27.1, 71699.0], [27.2, 71699.0], [27.3, 71699.0], [27.4, 71699.0], [27.5, 71699.0], [27.6, 71699.0], [27.7, 71699.0], [27.8, 71699.0], [27.9, 71699.0], [28.0, 73347.0], [28.1, 73347.0], [28.2, 73347.0], [28.3, 73347.0], [28.4, 73347.0], [28.5, 73347.0], [28.6, 73347.0], [28.7, 73347.0], [28.8, 73347.0], [28.9, 73347.0], [29.0, 73347.0], [29.1, 73809.0], [29.2, 73809.0], [29.3, 73809.0], [29.4, 73809.0], [29.5, 73809.0], [29.6, 73809.0], [29.7, 73809.0], [29.8, 73809.0], [29.9, 73809.0], [30.0, 73809.0], [30.1, 73809.0], [30.2, 74222.0], [30.3, 74222.0], [30.4, 74222.0], [30.5, 74222.0], [30.6, 74222.0], [30.7, 74222.0], [30.8, 74222.0], [30.9, 74222.0], [31.0, 74222.0], [31.1, 74222.0], [31.2, 74362.0], [31.3, 74362.0], [31.4, 74362.0], [31.5, 74362.0], [31.6, 74362.0], [31.7, 74362.0], [31.8, 74362.0], [31.9, 74362.0], [32.0, 74362.0], [32.1, 74362.0], [32.2, 74362.0], [32.3, 74865.0], [32.4, 74865.0], [32.5, 74865.0], [32.6, 74865.0], [32.7, 74865.0], [32.8, 74865.0], [32.9, 74865.0], [33.0, 74865.0], [33.1, 74865.0], [33.2, 74865.0], [33.3, 74865.0], [33.4, 75555.0], [33.5, 75555.0], [33.6, 75555.0], [33.7, 75555.0], [33.8, 75555.0], [33.9, 75555.0], [34.0, 75555.0], [34.1, 75555.0], [34.2, 75555.0], [34.3, 75555.0], [34.4, 75555.0], [34.5, 76629.0], [34.6, 76629.0], [34.7, 76629.0], [34.8, 76629.0], [34.9, 76629.0], [35.0, 76629.0], [35.1, 76629.0], [35.2, 76629.0], [35.3, 76629.0], [35.4, 76629.0], [35.5, 78085.0], [35.6, 78085.0], [35.7, 78085.0], [35.8, 78085.0], [35.9, 78085.0], [36.0, 78085.0], [36.1, 78085.0], [36.2, 78085.0], [36.3, 78085.0], [36.4, 78085.0], [36.5, 78085.0], [36.6, 80054.0], [36.7, 80054.0], [36.8, 80054.0], [36.9, 80054.0], [37.0, 80054.0], [37.1, 80054.0], [37.2, 80054.0], [37.3, 80054.0], [37.4, 80054.0], [37.5, 80054.0], [37.6, 80054.0], [37.7, 80258.0], [37.8, 80258.0], [37.9, 80258.0], [38.0, 80258.0], [38.1, 80258.0], [38.2, 80258.0], [38.3, 80258.0], [38.4, 80258.0], [38.5, 80258.0], [38.6, 80258.0], [38.7, 80258.0], [38.8, 82974.0], [38.9, 82974.0], [39.0, 82974.0], [39.1, 82974.0], [39.2, 82974.0], [39.3, 82974.0], [39.4, 82974.0], [39.5, 82974.0], [39.6, 82974.0], [39.7, 82974.0], [39.8, 83224.0], [39.9, 83224.0], [40.0, 83224.0], [40.1, 83224.0], [40.2, 83224.0], [40.3, 83224.0], [40.4, 83224.0], [40.5, 83224.0], [40.6, 83224.0], [40.7, 83224.0], [40.8, 83224.0], [40.9, 83802.0], [41.0, 83802.0], [41.1, 83802.0], [41.2, 83802.0], [41.3, 83802.0], [41.4, 83802.0], [41.5, 83802.0], [41.6, 83802.0], [41.7, 83802.0], [41.8, 83802.0], [41.9, 83802.0], [42.0, 83914.0], [42.1, 83914.0], [42.2, 83914.0], [42.3, 83914.0], [42.4, 83914.0], [42.5, 83914.0], [42.6, 83914.0], [42.7, 83914.0], [42.8, 83914.0], [42.9, 83914.0], [43.0, 83914.0], [43.1, 84220.0], [43.2, 84220.0], [43.3, 84220.0], [43.4, 84220.0], [43.5, 84220.0], [43.6, 84220.0], [43.7, 84220.0], [43.8, 84220.0], [43.9, 84220.0], [44.0, 84220.0], [44.1, 84491.0], [44.2, 84491.0], [44.3, 84491.0], [44.4, 84491.0], [44.5, 84491.0], [44.6, 84491.0], [44.7, 84491.0], [44.8, 84491.0], [44.9, 84491.0], [45.0, 84491.0], [45.1, 84491.0], [45.2, 84656.0], [45.3, 84656.0], [45.4, 84656.0], [45.5, 84656.0], [45.6, 84656.0], [45.7, 84656.0], [45.8, 84656.0], [45.9, 84656.0], [46.0, 84656.0], [46.1, 84656.0], [46.2, 84656.0], [46.3, 85058.0], [46.4, 85058.0], [46.5, 85058.0], [46.6, 85058.0], [46.7, 85058.0], [46.8, 85058.0], [46.9, 85058.0], [47.0, 85058.0], [47.1, 85058.0], [47.2, 85058.0], [47.3, 85058.0], [47.4, 85844.0], [47.5, 85844.0], [47.6, 85844.0], [47.7, 85844.0], [47.8, 85844.0], [47.9, 85844.0], [48.0, 85844.0], [48.1, 85844.0], [48.2, 85844.0], [48.3, 85844.0], [48.4, 86079.0], [48.5, 86079.0], [48.6, 86079.0], [48.7, 86079.0], [48.8, 86079.0], [48.9, 86079.0], [49.0, 86079.0], [49.1, 86079.0], [49.2, 86079.0], [49.3, 86079.0], [49.4, 86079.0], [49.5, 86418.0], [49.6, 86418.0], [49.7, 86418.0], [49.8, 86418.0], [49.9, 86418.0], [50.0, 86418.0], [50.1, 86418.0], [50.2, 86418.0], [50.3, 86418.0], [50.4, 86418.0], [50.5, 86418.0], [50.6, 87191.0], [50.7, 87191.0], [50.8, 87191.0], [50.9, 87191.0], [51.0, 87191.0], [51.1, 87191.0], [51.2, 87191.0], [51.3, 87191.0], [51.4, 87191.0], [51.5, 87191.0], [51.6, 87191.0], [51.7, 87635.0], [51.8, 87635.0], [51.9, 87635.0], [52.0, 87635.0], [52.1, 87635.0], [52.2, 87635.0], [52.3, 87635.0], [52.4, 87635.0], [52.5, 87635.0], [52.6, 87635.0], [52.7, 87730.0], [52.8, 87730.0], [52.9, 87730.0], [53.0, 87730.0], [53.1, 87730.0], [53.2, 87730.0], [53.3, 87730.0], [53.4, 87730.0], [53.5, 87730.0], [53.6, 87730.0], [53.7, 87730.0], [53.8, 87748.0], [53.9, 87748.0], [54.0, 87748.0], [54.1, 87748.0], [54.2, 87748.0], [54.3, 87748.0], [54.4, 87748.0], [54.5, 87748.0], [54.6, 87748.0], [54.7, 87748.0], [54.8, 87748.0], [54.9, 88077.0], [55.0, 88077.0], [55.1, 88077.0], [55.2, 88077.0], [55.3, 88077.0], [55.4, 88077.0], [55.5, 88077.0], [55.6, 88077.0], [55.7, 88077.0], [55.8, 88077.0], [55.9, 88077.0], [56.0, 88093.0], [56.1, 88093.0], [56.2, 88093.0], [56.3, 88093.0], [56.4, 88093.0], [56.5, 88093.0], [56.6, 88093.0], [56.7, 88093.0], [56.8, 88093.0], [56.9, 88093.0], [57.0, 88575.0], [57.1, 88575.0], [57.2, 88575.0], [57.3, 88575.0], [57.4, 88575.0], [57.5, 88575.0], [57.6, 88575.0], [57.7, 88575.0], [57.8, 88575.0], [57.9, 88575.0], [58.0, 88575.0], [58.1, 88591.0], [58.2, 88591.0], [58.3, 88591.0], [58.4, 88591.0], [58.5, 88591.0], [58.6, 88591.0], [58.7, 88591.0], [58.8, 88591.0], [58.9, 88591.0], [59.0, 88591.0], [59.1, 88591.0], [59.2, 88742.0], [59.3, 88742.0], [59.4, 88742.0], [59.5, 88742.0], [59.6, 88742.0], [59.7, 88742.0], [59.8, 88742.0], [59.9, 88742.0], [60.0, 88742.0], [60.1, 88742.0], [60.2, 88742.0], [60.3, 88875.0], [60.4, 88875.0], [60.5, 88875.0], [60.6, 88875.0], [60.7, 88875.0], [60.8, 88875.0], [60.9, 88875.0], [61.0, 88875.0], [61.1, 88875.0], [61.2, 88875.0], [61.3, 89073.0], [61.4, 89073.0], [61.5, 89073.0], [61.6, 89073.0], [61.7, 89073.0], [61.8, 89073.0], [61.9, 89073.0], [62.0, 89073.0], [62.1, 89073.0], [62.2, 89073.0], [62.3, 89073.0], [62.4, 90632.0], [62.5, 90632.0], [62.6, 90632.0], [62.7, 90632.0], [62.8, 90632.0], [62.9, 90632.0], [63.0, 90632.0], [63.1, 90632.0], [63.2, 90632.0], [63.3, 90632.0], [63.4, 90632.0], [63.5, 91096.0], [63.6, 91096.0], [63.7, 91096.0], [63.8, 91096.0], [63.9, 91096.0], [64.0, 91096.0], [64.1, 91096.0], [64.2, 91096.0], [64.3, 91096.0], [64.4, 91096.0], [64.5, 91096.0], [64.6, 91273.0], [64.7, 91273.0], [64.8, 91273.0], [64.9, 91273.0], [65.0, 91273.0], [65.1, 91273.0], [65.2, 91273.0], [65.3, 91273.0], [65.4, 91273.0], [65.5, 91273.0], [65.6, 91766.0], [65.7, 91766.0], [65.8, 91766.0], [65.9, 91766.0], [66.0, 91766.0], [66.1, 91766.0], [66.2, 91766.0], [66.3, 91766.0], [66.4, 91766.0], [66.5, 91766.0], [66.6, 91766.0], [66.7, 92398.0], [66.8, 92398.0], [66.9, 92398.0], [67.0, 92398.0], [67.1, 92398.0], [67.2, 92398.0], [67.3, 92398.0], [67.4, 92398.0], [67.5, 92398.0], [67.6, 92398.0], [67.7, 92398.0], [67.8, 93402.0], [67.9, 93402.0], [68.0, 93402.0], [68.1, 93402.0], [68.2, 93402.0], [68.3, 93402.0], [68.4, 93402.0], [68.5, 93402.0], [68.6, 93402.0], [68.7, 93402.0], [68.8, 93402.0], [68.9, 93888.0], [69.0, 93888.0], [69.1, 93888.0], [69.2, 93888.0], [69.3, 93888.0], [69.4, 93888.0], [69.5, 93888.0], [69.6, 93888.0], [69.7, 93888.0], [69.8, 93888.0], [69.9, 94408.0], [70.0, 94408.0], [70.1, 94408.0], [70.2, 94408.0], [70.3, 94408.0], [70.4, 94408.0], [70.5, 94408.0], [70.6, 94408.0], [70.7, 94408.0], [70.8, 94408.0], [70.9, 94408.0], [71.0, 94843.0], [71.1, 94843.0], [71.2, 94843.0], [71.3, 94843.0], [71.4, 94843.0], [71.5, 94843.0], [71.6, 94843.0], [71.7, 94843.0], [71.8, 94843.0], [71.9, 94843.0], [72.0, 94843.0], [72.1, 94871.0], [72.2, 94871.0], [72.3, 94871.0], [72.4, 94871.0], [72.5, 94871.0], [72.6, 94871.0], [72.7, 94871.0], [72.8, 94871.0], [72.9, 94871.0], [73.0, 94871.0], [73.1, 94871.0], [73.2, 94919.0], [73.3, 94919.0], [73.4, 94919.0], [73.5, 94919.0], [73.6, 94919.0], [73.7, 94919.0], [73.8, 94919.0], [73.9, 94919.0], [74.0, 94919.0], [74.1, 94919.0], [74.2, 95601.0], [74.3, 95601.0], [74.4, 95601.0], [74.5, 95601.0], [74.6, 95601.0], [74.7, 95601.0], [74.8, 95601.0], [74.9, 95601.0], [75.0, 95601.0], [75.1, 95601.0], [75.2, 95601.0], [75.3, 95652.0], [75.4, 95652.0], [75.5, 95652.0], [75.6, 95652.0], [75.7, 95652.0], [75.8, 95652.0], [75.9, 95652.0], [76.0, 95652.0], [76.1, 95652.0], [76.2, 95652.0], [76.3, 95652.0], [76.4, 95662.0], [76.5, 95662.0], [76.6, 95662.0], [76.7, 95662.0], [76.8, 95662.0], [76.9, 95662.0], [77.0, 95662.0], [77.1, 95662.0], [77.2, 95662.0], [77.3, 95662.0], [77.4, 95662.0], [77.5, 96053.0], [77.6, 96053.0], [77.7, 96053.0], [77.8, 96053.0], [77.9, 96053.0], [78.0, 96053.0], [78.1, 96053.0], [78.2, 96053.0], [78.3, 96053.0], [78.4, 96053.0], [78.5, 96546.0], [78.6, 96546.0], [78.7, 96546.0], [78.8, 96546.0], [78.9, 96546.0], [79.0, 96546.0], [79.1, 96546.0], [79.2, 96546.0], [79.3, 96546.0], [79.4, 96546.0], [79.5, 96546.0], [79.6, 96557.0], [79.7, 96557.0], [79.8, 96557.0], [79.9, 96557.0], [80.0, 96557.0], [80.1, 96557.0], [80.2, 96557.0], [80.3, 96557.0], [80.4, 96557.0], [80.5, 96557.0], [80.6, 96557.0], [80.7, 96800.0], [80.8, 96800.0], [80.9, 96800.0], [81.0, 96800.0], [81.1, 96800.0], [81.2, 96800.0], [81.3, 96800.0], [81.4, 96800.0], [81.5, 96800.0], [81.6, 96800.0], [81.7, 96800.0], [81.8, 96905.0], [81.9, 96905.0], [82.0, 96905.0], [82.1, 96905.0], [82.2, 96905.0], [82.3, 96905.0], [82.4, 96905.0], [82.5, 96905.0], [82.6, 96905.0], [82.7, 96905.0], [82.8, 97205.0], [82.9, 97205.0], [83.0, 97205.0], [83.1, 97205.0], [83.2, 97205.0], [83.3, 97205.0], [83.4, 97205.0], [83.5, 97205.0], [83.6, 97205.0], [83.7, 97205.0], [83.8, 97205.0], [83.9, 97441.0], [84.0, 97441.0], [84.1, 97441.0], [84.2, 97441.0], [84.3, 97441.0], [84.4, 97441.0], [84.5, 97441.0], [84.6, 97441.0], [84.7, 97441.0], [84.8, 97441.0], [84.9, 97441.0], [85.0, 97581.0], [85.1, 97581.0], [85.2, 97581.0], [85.3, 97581.0], [85.4, 97581.0], [85.5, 97581.0], [85.6, 97581.0], [85.7, 97581.0], [85.8, 97581.0], [85.9, 97581.0], [86.0, 97581.0], [86.1, 97599.0], [86.2, 97599.0], [86.3, 97599.0], [86.4, 97599.0], [86.5, 97599.0], [86.6, 97599.0], [86.7, 97599.0], [86.8, 97599.0], [86.9, 97599.0], [87.0, 97599.0], [87.1, 98167.0], [87.2, 98167.0], [87.3, 98167.0], [87.4, 98167.0], [87.5, 98167.0], [87.6, 98167.0], [87.7, 98167.0], [87.8, 98167.0], [87.9, 98167.0], [88.0, 98167.0], [88.1, 98167.0], [88.2, 98840.0], [88.3, 98840.0], [88.4, 98840.0], [88.5, 98840.0], [88.6, 98840.0], [88.7, 98840.0], [88.8, 98840.0], [88.9, 98840.0], [89.0, 98840.0], [89.1, 98840.0], [89.2, 98840.0], [89.3, 99138.0], [89.4, 99138.0], [89.5, 99138.0], [89.6, 99138.0], [89.7, 99138.0], [89.8, 99138.0], [89.9, 99138.0], [90.0, 99138.0], [90.1, 99138.0], [90.2, 99138.0], [90.3, 99138.0], [90.4, 99821.0], [90.5, 99821.0], [90.6, 99821.0], [90.7, 99821.0], [90.8, 99821.0], [90.9, 99821.0], [91.0, 99821.0], [91.1, 99821.0], [91.2, 99821.0], [91.3, 99821.0], [91.4, 99962.0], [91.5, 99962.0], [91.6, 99962.0], [91.7, 99962.0], [91.8, 99962.0], [91.9, 99962.0], [92.0, 99962.0], [92.1, 99962.0], [92.2, 99962.0], [92.3, 99962.0], [92.4, 99962.0], [92.5, 100235.0], [92.6, 100235.0], [92.7, 100235.0], [92.8, 100235.0], [92.9, 100235.0], [93.0, 100235.0], [93.1, 100235.0], [93.2, 100235.0], [93.3, 100235.0], [93.4, 100235.0], [93.5, 100235.0], [93.6, 101586.0], [93.7, 101586.0], [93.8, 101586.0], [93.9, 101586.0], [94.0, 101586.0], [94.1, 101586.0], [94.2, 101586.0], [94.3, 101586.0], [94.4, 101586.0], [94.5, 101586.0], [94.6, 101586.0], [94.7, 102076.0], [94.8, 102076.0], [94.9, 102076.0], [95.0, 102076.0], [95.1, 102076.0], [95.2, 102076.0], [95.3, 102076.0], [95.4, 102076.0], [95.5, 102076.0], [95.6, 102076.0], [95.7, 105698.0], [95.8, 105698.0], [95.9, 105698.0], [96.0, 105698.0], [96.1, 105698.0], [96.2, 105698.0], [96.3, 105698.0], [96.4, 105698.0], [96.5, 105698.0], [96.6, 105698.0], [96.7, 105698.0], [96.8, 107068.0], [96.9, 107068.0], [97.0, 107068.0], [97.1, 107068.0], [97.2, 107068.0], [97.3, 107068.0], [97.4, 107068.0], [97.5, 107068.0], [97.6, 107068.0], [97.7, 107068.0], [97.8, 107068.0], [97.9, 108648.0], [98.0, 108648.0], [98.1, 108648.0], [98.2, 108648.0], [98.3, 108648.0], [98.4, 108648.0], [98.5, 108648.0], [98.6, 108648.0], [98.7, 108648.0], [98.8, 108648.0], [98.9, 108648.0], [99.0, 111534.0], [99.1, 111534.0], [99.2, 111534.0], [99.3, 111534.0], [99.4, 111534.0], [99.5, 111534.0], [99.6, 111534.0], [99.7, 111534.0], [99.8, 111534.0], [99.9, 111534.0], [100.0, 111534.0]], "isOverall": false, "label": "POST /api/videos/upload", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
        getOptions: function() {
            return {
                series: {
                    points: { show: false }
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentiles'
                },
                xaxis: {
                    tickDecimals: 1,
                    axisLabel: "Percentiles",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Percentile value in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : %x.2 percentile was %y ms"
                },
                selection: { mode: "xy" },
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentiles"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesPercentiles"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesPercentiles"), dataset, prepareOverviewOptions(options));
        }
};

/**
 * @param elementId Id of element where we display message
 */
function setEmptyGraph(elementId) {
    $(function() {
        $(elementId).text("No graph series with filter="+seriesFilter);
    });
}

// Response times percentiles
function refreshResponseTimePercentiles() {
    var infos = responseTimePercentilesInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimePercentiles");
        return;
    }
    if (isGraph($("#flotResponseTimesPercentiles"))){
        infos.createGraph();
    } else {
        var choiceContainer = $("#choicesResponseTimePercentiles");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesPercentiles", "#overviewResponseTimesPercentiles");
        $('#bodyResponseTimePercentiles .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimeDistributionInfos = {
        data: {"result": {"minY": 1.0, "minX": 5100.0, "maxY": 3.0, "series": [{"data": [[68500.0, 2.0], [67300.0, 1.0], [73300.0, 1.0], [74300.0, 1.0], [75500.0, 1.0], [5100.0, 1.0], [82900.0, 1.0], [83900.0, 1.0], [87100.0, 1.0], [88500.0, 2.0], [87700.0, 2.0], [88700.0, 1.0], [91700.0, 1.0], [92300.0, 1.0], [94900.0, 1.0], [97500.0, 2.0], [96500.0, 2.0], [98100.0, 1.0], [96900.0, 1.0], [99900.0, 1.0], [101500.0, 1.0], [99100.0, 1.0], [6500.0, 1.0], [111500.0, 1.0], [9100.0, 1.0], [9900.0, 1.0], [21700.0, 1.0], [63400.0, 2.0], [63300.0, 1.0], [64800.0, 1.0], [65000.0, 2.0], [64100.0, 2.0], [64900.0, 1.0], [63600.0, 1.0], [64000.0, 1.0], [63700.0, 1.0], [65100.0, 1.0], [68600.0, 1.0], [66600.0, 1.0], [69000.0, 1.0], [71600.0, 1.0], [70600.0, 1.0], [73800.0, 1.0], [74200.0, 1.0], [74800.0, 1.0], [76600.0, 1.0], [80200.0, 1.0], [78000.0, 1.0], [80000.0, 1.0], [83200.0, 1.0], [85800.0, 1.0], [84200.0, 1.0], [83800.0, 1.0], [84600.0, 1.0], [85000.0, 1.0], [86000.0, 1.0], [84400.0, 1.0], [86400.0, 1.0], [89000.0, 1.0], [88000.0, 2.0], [87600.0, 1.0], [88800.0, 1.0], [93800.0, 1.0], [93400.0, 1.0], [90600.0, 1.0], [91200.0, 1.0], [91000.0, 1.0], [96800.0, 1.0], [95600.0, 3.0], [96000.0, 1.0], [94800.0, 2.0], [97400.0, 1.0], [94400.0, 1.0], [97200.0, 1.0], [99800.0, 1.0], [102000.0, 1.0], [98800.0, 1.0], [100200.0, 1.0], [105600.0, 1.0], [108600.0, 1.0], [107000.0, 1.0]], "isOverall": false, "label": "POST /api/videos/upload", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 111500.0, "title": "Response Time Distribution"}},
        getOptions: function() {
            var granularity = this.data.result.granularity;
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    barWidth: this.data.result.granularity
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " responses for " + label + " were between " + xval + " and " + (xval + granularity) + " ms";
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimeDistribution"), prepareData(data.result.series, $("#choicesResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshResponseTimeDistribution() {
    var infos = responseTimeDistributionInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeDistribution");
        return;
    }
    if (isGraph($("#flotResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var syntheticResponseTimeDistributionInfos = {
        data: {"result": {"minY": 5.0, "minX": 2.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 88.0, "series": [{"data": [], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 5.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [[3.0, 88.0]], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 3.0, "title": "Synthetic Response Times Distribution"}},
        getOptions: function() {
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendSyntheticResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times ranges",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                    tickLength:0,
                    min:-0.5,
                    max:3.5
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    align: "center",
                    barWidth: 0.25,
                    fill:.75
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " " + label;
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            options.xaxis.ticks = data.result.ticks;
            $.plot($("#flotSyntheticResponseTimeDistribution"), prepareData(data.result.series, $("#choicesSyntheticResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshSyntheticResponseTimeDistribution() {
    var infos = syntheticResponseTimeDistributionInfos;
    prepareSeries(infos.data, true);
    if (isGraph($("#flotSyntheticResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerSyntheticResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var activeThreadsOverTimeInfos = {
        data: {"result": {"minY": 6.5, "minX": 1.76144172E12, "maxY": 20.0, "series": [{"data": [[1.76144184E12, 20.0], [1.76144202E12, 20.0], [1.76144172E12, 7.0], [1.7614419E12, 20.0], [1.76144178E12, 20.0], [1.76144208E12, 16.5], [1.76144196E12, 20.0], [1.76144214E12, 6.5]], "isOverall": false, "label": "[S1] Fase 3 - Sostenida (80% de X)", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76144214E12, "title": "Active Threads Over Time"}},
        getOptions: function() {
            return {
                series: {
                    stack: true,
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 6,
                    show: true,
                    container: '#legendActiveThreadsOverTime'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                selection: {
                    mode: 'xy'
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : At %x there were %y active threads"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesActiveThreadsOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotActiveThreadsOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewActiveThreadsOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Active Threads Over Time
function refreshActiveThreadsOverTime(fixTimestamps) {
    var infos = activeThreadsOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotActiveThreadsOverTime"))) {
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesActiveThreadsOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotActiveThreadsOverTime", "#overviewActiveThreadsOverTime");
        $('#footerActiveThreadsOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var timeVsThreadsInfos = {
        data: {"result": {"minY": 34426.25, "minX": 1.0, "maxY": 107068.0, "series": [{"data": [[2.0, 58355.0], [8.0, 97205.0], [9.0, 34426.25], [10.0, 98840.0], [11.0, 101586.0], [12.0, 73347.0], [3.0, 99138.0], [13.0, 88742.0], [14.0, 84491.0], [15.0, 88575.0], [16.0, 102076.0], [4.0, 107068.0], [1.0, 76629.0], [17.0, 74865.0], [18.0, 65179.0], [19.0, 63713.0], [20.0, 83362.94202898552], [5.0, 92398.0], [6.0, 50867.0], [7.0, 94871.0]], "isOverall": false, "label": "POST /api/videos/upload", "isController": false}, {"data": [[17.258064516129036, 80827.04301075268]], "isOverall": false, "label": "POST /api/videos/upload-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 20.0, "title": "Time VS Threads"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: { noColumns: 2,show: true, container: '#legendTimeVsThreads' },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: At %x.2 active threads, Average response time was %y.2 ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesTimeVsThreads"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotTimesVsThreads"), dataset, options);
            // setup overview
            $.plot($("#overviewTimesVsThreads"), dataset, prepareOverviewOptions(options));
        }
};

// Time vs threads
function refreshTimeVsThreads(){
    var infos = timeVsThreadsInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTimeVsThreads");
        return;
    }
    if(isGraph($("#flotTimesVsThreads"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTimeVsThreads");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTimesVsThreads", "#overviewTimesVsThreads");
        $('#footerTimeVsThreads .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var bytesThroughputOverTimeInfos = {
        data : {"result": {"minY": 10.966666666666667, "minX": 1.76144172E12, "maxY": 5946887.6, "series": [{"data": [[1.76144184E12, 104.18333333333334], [1.76144202E12, 109.66666666666667], [1.76144172E12, 21.916666666666668], [1.7614419E12, 109.66666666666667], [1.76144178E12, 10.966666666666667], [1.76144208E12, 43.86666666666667], [1.76144196E12, 38.38333333333333], [1.76144214E12, 65.8]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.76144184E12, 5649541.233333333], [1.76144202E12, 5946887.6], [1.76144172E12, 1486721.5], [1.7614419E12, 5946884.0], [1.76144178E12, 594688.8], [1.76144208E12, 2378753.8666666667], [1.76144196E12, 2081409.5], [1.76144214E12, 3568132.8666666667]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76144214E12, "title": "Bytes Throughput Over Time"}},
        getOptions : function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity) ,
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Bytes / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendBytesThroughputOverTime'
                },
                selection: {
                    mode: "xy"
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y"
                }
            };
        },
        createGraph : function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesBytesThroughputOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotBytesThroughputOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewBytesThroughputOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Bytes throughput Over Time
function refreshBytesThroughputOverTime(fixTimestamps) {
    var infos = bytesThroughputOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotBytesThroughputOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesBytesThroughputOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotBytesThroughputOverTime", "#overviewBytesThroughputOverTime");
        $('#footerBytesThroughputOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimesOverTimeInfos = {
        data: {"result": {"minY": 10522.8, "minX": 1.76144172E12, "maxY": 95384.75, "series": [{"data": [[1.76144184E12, 90139.68421052632], [1.76144202E12, 83956.95], [1.76144172E12, 10522.8], [1.7614419E12, 83692.15], [1.76144178E12, 78793.0], [1.76144208E12, 78956.0], [1.76144196E12, 66402.0], [1.76144214E12, 95384.75]], "isOverall": false, "label": "POST /api/videos/upload", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76144214E12, "title": "Response Time Over Time"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average response time was %y ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Times Over Time
function refreshResponseTimeOverTime(fixTimestamps) {
    var infos = responseTimesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotResponseTimesOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesOverTime", "#overviewResponseTimesOverTime");
        $('#footerResponseTimesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var latenciesOverTimeInfos = {
        data: {"result": {"minY": 10521.2, "minX": 1.76144172E12, "maxY": 95384.5, "series": [{"data": [[1.76144184E12, 90139.52631578947], [1.76144202E12, 83956.75], [1.76144172E12, 10521.2], [1.7614419E12, 83691.95000000001], [1.76144178E12, 78792.5], [1.76144208E12, 78955.75], [1.76144196E12, 66401.85714285714], [1.76144214E12, 95384.5]], "isOverall": false, "label": "POST /api/videos/upload", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76144214E12, "title": "Latencies Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response latencies in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendLatenciesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average latency was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesLatenciesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotLatenciesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewLatenciesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Latencies Over Time
function refreshLatenciesOverTime(fixTimestamps) {
    var infos = latenciesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyLatenciesOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotLatenciesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesLatenciesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotLatenciesOverTime", "#overviewLatenciesOverTime");
        $('#footerLatenciesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var connectTimeOverTimeInfos = {
        data: {"result": {"minY": 84.875, "minX": 1.76144172E12, "maxY": 92.0, "series": [{"data": [[1.76144184E12, 85.89473684210526], [1.76144202E12, 87.75], [1.76144172E12, 88.0], [1.7614419E12, 86.0], [1.76144178E12, 85.0], [1.76144208E12, 84.875], [1.76144196E12, 92.0], [1.76144214E12, 89.16666666666667]], "isOverall": false, "label": "POST /api/videos/upload", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76144214E12, "title": "Connect Time Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getConnectTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average Connect Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendConnectTimeOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average connect time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesConnectTimeOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotConnectTimeOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewConnectTimeOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Connect Time Over Time
function refreshConnectTimeOverTime(fixTimestamps) {
    var infos = connectTimeOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyConnectTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotConnectTimeOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesConnectTimeOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotConnectTimeOverTime", "#overviewConnectTimeOverTime");
        $('#footerConnectTimeOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var responseTimePercentilesOverTimeInfos = {
        data: {"result": {"minY": 5176.0, "minX": 1.76144172E12, "maxY": 21737.0, "series": [{"data": [[1.76144172E12, 21737.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.76144172E12, 5176.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.76144172E12, 21737.0]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.76144172E12, 21737.0]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.76144172E12, 9152.0]], "isOverall": false, "label": "Median", "isController": false}, {"data": [[1.76144172E12, 21737.0]], "isOverall": false, "label": "95th percentile", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76144172E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Response Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentilesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Response time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentilesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimePercentilesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimePercentilesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Time Percentiles Over Time
function refreshResponseTimePercentilesOverTime(fixTimestamps) {
    var infos = responseTimePercentilesOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotResponseTimePercentilesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimePercentilesOverTime", "#overviewResponseTimePercentilesOverTime");
        $('#footerResponseTimePercentilesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var responseTimeVsRequestInfos = {
    data: {"result": {"minY": 7866.5, "minX": 1.0, "maxY": 88808.5, "series": [{"data": [[1.0, 9968.0], [2.0, 7866.5]], "isOverall": false, "label": "Successes", "isController": false}, {"data": [[1.0, 87191.0], [2.0, 88808.5], [3.0, 69030.0]], "isOverall": false, "label": "Failures", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 3.0, "title": "Response Time Vs Request"}},
    getOptions: function() {
        return {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Response Time in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: {
                noColumns: 2,
                show: true,
                container: '#legendResponseTimeVsRequest'
            },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median response time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesResponseTimeVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotResponseTimeVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewResponseTimeVsRequest"), dataset, prepareOverviewOptions(options));

    }
};

// Response Time vs Request
function refreshResponseTimeVsRequest() {
    var infos = responseTimeVsRequestInfos;
    prepareSeries(infos.data);
    if (isGraph($("#flotResponseTimeVsRequest"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeVsRequest");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimeVsRequest", "#overviewResponseTimeVsRequest");
        $('#footerResponseRimeVsRequest .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var latenciesVsRequestInfos = {
    data: {"result": {"minY": 7866.5, "minX": 1.0, "maxY": 88808.5, "series": [{"data": [[1.0, 9968.0], [2.0, 7866.5]], "isOverall": false, "label": "Successes", "isController": false}, {"data": [[1.0, 87191.0], [2.0, 88808.5], [3.0, 69030.0]], "isOverall": false, "label": "Failures", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 3.0, "title": "Latencies Vs Request"}},
    getOptions: function() {
        return{
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Latency in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: { noColumns: 2,show: true, container: '#legendLatencyVsRequest' },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median Latency time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesLatencyVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotLatenciesVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewLatenciesVsRequest"), dataset, prepareOverviewOptions(options));
    }
};

// Latencies vs Request
function refreshLatenciesVsRequest() {
        var infos = latenciesVsRequestInfos;
        prepareSeries(infos.data);
        if(isGraph($("#flotLatenciesVsRequest"))){
            infos.createGraph();
        }else{
            var choiceContainer = $("#choicesLatencyVsRequest");
            createLegend(choiceContainer, infos);
            infos.createGraph();
            setGraphZoomable("#flotLatenciesVsRequest", "#overviewLatenciesVsRequest");
            $('#footerLatenciesVsRequest .legendColorBox > div').each(function(i){
                $(this).clone().prependTo(choiceContainer.find("li").eq(i));
            });
        }
};

var hitsPerSecondInfos = {
        data: {"result": {"minY": 0.08333333333333333, "minX": 1.76144172E12, "maxY": 0.36666666666666664, "series": [{"data": [[1.76144184E12, 0.31666666666666665], [1.76144202E12, 0.3333333333333333], [1.76144172E12, 0.36666666666666664], [1.7614419E12, 0.3333333333333333], [1.76144178E12, 0.08333333333333333], [1.76144196E12, 0.11666666666666667]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76144202E12, "title": "Hits Per Second"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of hits / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendHitsPerSecond"
                },
                selection: {
                    mode : 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y.2 hits/sec"
                }
            };
        },
        createGraph: function createGraph() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesHitsPerSecond"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotHitsPerSecond"), dataset, options);
            // setup overview
            $.plot($("#overviewHitsPerSecond"), dataset, prepareOverviewOptions(options));
        }
};

// Hits per second
function refreshHitsPerSecond(fixTimestamps) {
    var infos = hitsPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if (isGraph($("#flotHitsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesHitsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotHitsPerSecond", "#overviewHitsPerSecond");
        $('#footerHitsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var codesPerSecondInfos = {
        data: {"result": {"minY": 0.03333333333333333, "minX": 1.76144172E12, "maxY": 0.3333333333333333, "series": [{"data": [[1.76144172E12, 0.08333333333333333]], "isOverall": false, "label": "201", "isController": false}, {"data": [[1.76144184E12, 0.31666666666666665], [1.76144202E12, 0.3333333333333333], [1.7614419E12, 0.3333333333333333], [1.76144178E12, 0.03333333333333333], [1.76144208E12, 0.13333333333333333], [1.76144196E12, 0.11666666666666667], [1.76144214E12, 0.2]], "isOverall": false, "label": "504", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76144214E12, "title": "Codes Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendCodesPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "Number of Response Codes %s at %x was %y.2 responses / sec"
                }
            };
        },
    createGraph: function() {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesCodesPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotCodesPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewCodesPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Codes per second
function refreshCodesPerSecond(fixTimestamps) {
    var infos = codesPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotCodesPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesCodesPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotCodesPerSecond", "#overviewCodesPerSecond");
        $('#footerCodesPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var transactionsPerSecondInfos = {
        data: {"result": {"minY": 0.03333333333333333, "minX": 1.76144172E12, "maxY": 0.3333333333333333, "series": [{"data": [[1.76144172E12, 0.08333333333333333]], "isOverall": false, "label": "POST /api/videos/upload-success", "isController": false}, {"data": [[1.76144184E12, 0.31666666666666665], [1.76144202E12, 0.3333333333333333], [1.7614419E12, 0.3333333333333333], [1.76144178E12, 0.03333333333333333], [1.76144208E12, 0.13333333333333333], [1.76144196E12, 0.11666666666666667], [1.76144214E12, 0.2]], "isOverall": false, "label": "POST /api/videos/upload-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76144214E12, "title": "Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTransactionsPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                }
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTransactionsPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTransactionsPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewTransactionsPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Transactions per second
function refreshTransactionsPerSecond(fixTimestamps) {
    var infos = transactionsPerSecondInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTransactionsPerSecond");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotTransactionsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTransactionsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTransactionsPerSecond", "#overviewTransactionsPerSecond");
        $('#footerTransactionsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var totalTPSInfos = {
        data: {"result": {"minY": 0.03333333333333333, "minX": 1.76144172E12, "maxY": 0.3333333333333333, "series": [{"data": [[1.76144172E12, 0.08333333333333333]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [[1.76144184E12, 0.31666666666666665], [1.76144202E12, 0.3333333333333333], [1.7614419E12, 0.3333333333333333], [1.76144178E12, 0.03333333333333333], [1.76144208E12, 0.13333333333333333], [1.76144196E12, 0.11666666666666667], [1.76144214E12, 0.2]], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76144214E12, "title": "Total Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTotalTPS"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                },
                colors: ["#9ACD32", "#FF6347"]
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTotalTPS"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTotalTPS"), dataset, options);
        // setup overview
        $.plot($("#overviewTotalTPS"), dataset, prepareOverviewOptions(options));
    }
};

// Total Transactions per second
function refreshTotalTPS(fixTimestamps) {
    var infos = totalTPSInfos;
    // We want to ignore seriesFilter
    prepareSeries(infos.data, false, true);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, -18000000);
    }
    if(isGraph($("#flotTotalTPS"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTotalTPS");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTotalTPS", "#overviewTotalTPS");
        $('#footerTotalTPS .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

// Collapse the graph matching the specified DOM element depending the collapsed
// status
function collapse(elem, collapsed){
    if(collapsed){
        $(elem).parent().find(".fa-chevron-up").removeClass("fa-chevron-up").addClass("fa-chevron-down");
    } else {
        $(elem).parent().find(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-up");
        if (elem.id == "bodyBytesThroughputOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshBytesThroughputOverTime(true);
            }
            document.location.href="#bytesThroughputOverTime";
        } else if (elem.id == "bodyLatenciesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesOverTime(true);
            }
            document.location.href="#latenciesOverTime";
        } else if (elem.id == "bodyCustomGraph") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCustomGraph(true);
            }
            document.location.href="#responseCustomGraph";
        } else if (elem.id == "bodyConnectTimeOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshConnectTimeOverTime(true);
            }
            document.location.href="#connectTimeOverTime";
        } else if (elem.id == "bodyResponseTimePercentilesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimePercentilesOverTime(true);
            }
            document.location.href="#responseTimePercentilesOverTime";
        } else if (elem.id == "bodyResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeDistribution();
            }
            document.location.href="#responseTimeDistribution" ;
        } else if (elem.id == "bodySyntheticResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshSyntheticResponseTimeDistribution();
            }
            document.location.href="#syntheticResponseTimeDistribution" ;
        } else if (elem.id == "bodyActiveThreadsOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshActiveThreadsOverTime(true);
            }
            document.location.href="#activeThreadsOverTime";
        } else if (elem.id == "bodyTimeVsThreads") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTimeVsThreads();
            }
            document.location.href="#timeVsThreads" ;
        } else if (elem.id == "bodyCodesPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCodesPerSecond(true);
            }
            document.location.href="#codesPerSecond";
        } else if (elem.id == "bodyTransactionsPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTransactionsPerSecond(true);
            }
            document.location.href="#transactionsPerSecond";
        } else if (elem.id == "bodyTotalTPS") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTotalTPS(true);
            }
            document.location.href="#totalTPS";
        } else if (elem.id == "bodyResponseTimeVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeVsRequest();
            }
            document.location.href="#responseTimeVsRequest";
        } else if (elem.id == "bodyLatenciesVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesVsRequest();
            }
            document.location.href="#latencyVsRequest";
        }
    }
}

/*
 * Activates or deactivates all series of the specified graph (represented by id parameter)
 * depending on checked argument.
 */
function toggleAll(id, checked){
    var placeholder = document.getElementById(id);

    var cases = $(placeholder).find(':checkbox');
    cases.prop('checked', checked);
    $(cases).parent().children().children().toggleClass("legend-disabled", !checked);

    var choiceContainer;
    if ( id == "choicesBytesThroughputOverTime"){
        choiceContainer = $("#choicesBytesThroughputOverTime");
        refreshBytesThroughputOverTime(false);
    } else if(id == "choicesResponseTimesOverTime"){
        choiceContainer = $("#choicesResponseTimesOverTime");
        refreshResponseTimeOverTime(false);
    }else if(id == "choicesResponseCustomGraph"){
        choiceContainer = $("#choicesResponseCustomGraph");
        refreshCustomGraph(false);
    } else if ( id == "choicesLatenciesOverTime"){
        choiceContainer = $("#choicesLatenciesOverTime");
        refreshLatenciesOverTime(false);
    } else if ( id == "choicesConnectTimeOverTime"){
        choiceContainer = $("#choicesConnectTimeOverTime");
        refreshConnectTimeOverTime(false);
    } else if ( id == "choicesResponseTimePercentilesOverTime"){
        choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        refreshResponseTimePercentilesOverTime(false);
    } else if ( id == "choicesResponseTimePercentiles"){
        choiceContainer = $("#choicesResponseTimePercentiles");
        refreshResponseTimePercentiles();
    } else if(id == "choicesActiveThreadsOverTime"){
        choiceContainer = $("#choicesActiveThreadsOverTime");
        refreshActiveThreadsOverTime(false);
    } else if ( id == "choicesTimeVsThreads"){
        choiceContainer = $("#choicesTimeVsThreads");
        refreshTimeVsThreads();
    } else if ( id == "choicesSyntheticResponseTimeDistribution"){
        choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        refreshSyntheticResponseTimeDistribution();
    } else if ( id == "choicesResponseTimeDistribution"){
        choiceContainer = $("#choicesResponseTimeDistribution");
        refreshResponseTimeDistribution();
    } else if ( id == "choicesHitsPerSecond"){
        choiceContainer = $("#choicesHitsPerSecond");
        refreshHitsPerSecond(false);
    } else if(id == "choicesCodesPerSecond"){
        choiceContainer = $("#choicesCodesPerSecond");
        refreshCodesPerSecond(false);
    } else if ( id == "choicesTransactionsPerSecond"){
        choiceContainer = $("#choicesTransactionsPerSecond");
        refreshTransactionsPerSecond(false);
    } else if ( id == "choicesTotalTPS"){
        choiceContainer = $("#choicesTotalTPS");
        refreshTotalTPS(false);
    } else if ( id == "choicesResponseTimeVsRequest"){
        choiceContainer = $("#choicesResponseTimeVsRequest");
        refreshResponseTimeVsRequest();
    } else if ( id == "choicesLatencyVsRequest"){
        choiceContainer = $("#choicesLatencyVsRequest");
        refreshLatenciesVsRequest();
    }
    var color = checked ? "black" : "#818181";
    if(choiceContainer != null) {
        choiceContainer.find("label").each(function(){
            this.style.color = color;
        });
    }
}

