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
        data: {"result": {"minY": 0.0, "minX": 0.0, "maxY": 2035.0, "series": [{"data": [[0.0, 0.0], [0.1, 0.0], [0.2, 0.0], [0.3, 1.0], [0.4, 1.0], [0.5, 2.0], [0.6, 2.0], [0.7, 3.0], [0.8, 3.0], [0.9, 3.0], [1.0, 4.0], [1.1, 4.0], [1.2, 5.0], [1.3, 5.0], [1.4, 6.0], [1.5, 6.0], [1.6, 6.0], [1.7, 6.0], [1.8, 7.0], [1.9, 7.0], [2.0, 7.0], [2.1, 7.0], [2.2, 7.0], [2.3, 7.0], [2.4, 7.0], [2.5, 7.0], [2.6, 7.0], [2.7, 7.0], [2.8, 7.0], [2.9, 7.0], [3.0, 8.0], [3.1, 8.0], [3.2, 8.0], [3.3, 8.0], [3.4, 8.0], [3.5, 8.0], [3.6, 9.0], [3.7, 9.0], [3.8, 9.0], [3.9, 9.0], [4.0, 10.0], [4.1, 10.0], [4.2, 10.0], [4.3, 10.0], [4.4, 11.0], [4.5, 11.0], [4.6, 11.0], [4.7, 11.0], [4.8, 12.0], [4.9, 12.0], [5.0, 12.0], [5.1, 12.0], [5.2, 13.0], [5.3, 13.0], [5.4, 13.0], [5.5, 13.0], [5.6, 13.0], [5.7, 13.0], [5.8, 13.0], [5.9, 14.0], [6.0, 14.0], [6.1, 14.0], [6.2, 14.0], [6.3, 14.0], [6.4, 14.0], [6.5, 14.0], [6.6, 14.0], [6.7, 14.0], [6.8, 14.0], [6.9, 14.0], [7.0, 14.0], [7.1, 14.0], [7.2, 14.0], [7.3, 15.0], [7.4, 15.0], [7.5, 15.0], [7.6, 15.0], [7.7, 15.0], [7.8, 16.0], [7.9, 16.0], [8.0, 16.0], [8.1, 17.0], [8.2, 17.0], [8.3, 18.0], [8.4, 18.0], [8.5, 19.0], [8.6, 19.0], [8.7, 20.0], [8.8, 20.0], [8.9, 20.0], [9.0, 21.0], [9.1, 21.0], [9.2, 21.0], [9.3, 21.0], [9.4, 21.0], [9.5, 22.0], [9.6, 22.0], [9.7, 23.0], [9.8, 25.0], [9.9, 27.0], [10.0, 28.0], [10.1, 32.0], [10.2, 39.0], [10.3, 168.0], [10.4, 169.0], [10.5, 169.0], [10.6, 170.0], [10.7, 170.0], [10.8, 170.0], [10.9, 171.0], [11.0, 171.0], [11.1, 171.0], [11.2, 171.0], [11.3, 171.0], [11.4, 171.0], [11.5, 172.0], [11.6, 172.0], [11.7, 172.0], [11.8, 172.0], [11.9, 172.0], [12.0, 172.0], [12.1, 172.0], [12.2, 172.0], [12.3, 172.0], [12.4, 173.0], [12.5, 173.0], [12.6, 173.0], [12.7, 173.0], [12.8, 173.0], [12.9, 173.0], [13.0, 173.0], [13.1, 173.0], [13.2, 173.0], [13.3, 173.0], [13.4, 173.0], [13.5, 173.0], [13.6, 173.0], [13.7, 173.0], [13.8, 174.0], [13.9, 174.0], [14.0, 174.0], [14.1, 174.0], [14.2, 174.0], [14.3, 174.0], [14.4, 174.0], [14.5, 174.0], [14.6, 174.0], [14.7, 174.0], [14.8, 174.0], [14.9, 174.0], [15.0, 174.0], [15.1, 174.0], [15.2, 174.0], [15.3, 174.0], [15.4, 174.0], [15.5, 174.0], [15.6, 174.0], [15.7, 175.0], [15.8, 175.0], [15.9, 175.0], [16.0, 175.0], [16.1, 175.0], [16.2, 175.0], [16.3, 175.0], [16.4, 175.0], [16.5, 175.0], [16.6, 175.0], [16.7, 175.0], [16.8, 175.0], [16.9, 175.0], [17.0, 175.0], [17.1, 175.0], [17.2, 175.0], [17.3, 175.0], [17.4, 175.0], [17.5, 175.0], [17.6, 175.0], [17.7, 175.0], [17.8, 175.0], [17.9, 175.0], [18.0, 176.0], [18.1, 176.0], [18.2, 176.0], [18.3, 176.0], [18.4, 176.0], [18.5, 176.0], [18.6, 176.0], [18.7, 176.0], [18.8, 176.0], [18.9, 176.0], [19.0, 176.0], [19.1, 176.0], [19.2, 176.0], [19.3, 176.0], [19.4, 176.0], [19.5, 176.0], [19.6, 176.0], [19.7, 176.0], [19.8, 176.0], [19.9, 176.0], [20.0, 176.0], [20.1, 176.0], [20.2, 176.0], [20.3, 176.0], [20.4, 176.0], [20.5, 176.0], [20.6, 176.0], [20.7, 177.0], [20.8, 177.0], [20.9, 177.0], [21.0, 177.0], [21.1, 177.0], [21.2, 177.0], [21.3, 177.0], [21.4, 177.0], [21.5, 177.0], [21.6, 177.0], [21.7, 177.0], [21.8, 177.0], [21.9, 177.0], [22.0, 177.0], [22.1, 177.0], [22.2, 177.0], [22.3, 177.0], [22.4, 177.0], [22.5, 177.0], [22.6, 177.0], [22.7, 177.0], [22.8, 177.0], [22.9, 177.0], [23.0, 177.0], [23.1, 177.0], [23.2, 177.0], [23.3, 177.0], [23.4, 177.0], [23.5, 177.0], [23.6, 177.0], [23.7, 178.0], [23.8, 178.0], [23.9, 178.0], [24.0, 178.0], [24.1, 178.0], [24.2, 178.0], [24.3, 178.0], [24.4, 178.0], [24.5, 178.0], [24.6, 178.0], [24.7, 178.0], [24.8, 178.0], [24.9, 178.0], [25.0, 178.0], [25.1, 178.0], [25.2, 178.0], [25.3, 178.0], [25.4, 178.0], [25.5, 178.0], [25.6, 178.0], [25.7, 178.0], [25.8, 178.0], [25.9, 178.0], [26.0, 178.0], [26.1, 178.0], [26.2, 178.0], [26.3, 178.0], [26.4, 178.0], [26.5, 178.0], [26.6, 178.0], [26.7, 178.0], [26.8, 178.0], [26.9, 178.0], [27.0, 178.0], [27.1, 178.0], [27.2, 179.0], [27.3, 179.0], [27.4, 179.0], [27.5, 179.0], [27.6, 179.0], [27.7, 179.0], [27.8, 179.0], [27.9, 179.0], [28.0, 179.0], [28.1, 179.0], [28.2, 179.0], [28.3, 179.0], [28.4, 179.0], [28.5, 179.0], [28.6, 179.0], [28.7, 179.0], [28.8, 179.0], [28.9, 179.0], [29.0, 179.0], [29.1, 179.0], [29.2, 179.0], [29.3, 179.0], [29.4, 179.0], [29.5, 179.0], [29.6, 179.0], [29.7, 179.0], [29.8, 179.0], [29.9, 179.0], [30.0, 179.0], [30.1, 179.0], [30.2, 179.0], [30.3, 179.0], [30.4, 179.0], [30.5, 179.0], [30.6, 179.0], [30.7, 179.0], [30.8, 179.0], [30.9, 180.0], [31.0, 180.0], [31.1, 180.0], [31.2, 180.0], [31.3, 180.0], [31.4, 180.0], [31.5, 180.0], [31.6, 180.0], [31.7, 180.0], [31.8, 180.0], [31.9, 180.0], [32.0, 180.0], [32.1, 180.0], [32.2, 180.0], [32.3, 180.0], [32.4, 180.0], [32.5, 180.0], [32.6, 180.0], [32.7, 180.0], [32.8, 180.0], [32.9, 180.0], [33.0, 180.0], [33.1, 180.0], [33.2, 180.0], [33.3, 180.0], [33.4, 180.0], [33.5, 180.0], [33.6, 180.0], [33.7, 180.0], [33.8, 180.0], [33.9, 180.0], [34.0, 180.0], [34.1, 180.0], [34.2, 180.0], [34.3, 180.0], [34.4, 180.0], [34.5, 180.0], [34.6, 180.0], [34.7, 180.0], [34.8, 181.0], [34.9, 181.0], [35.0, 181.0], [35.1, 181.0], [35.2, 181.0], [35.3, 181.0], [35.4, 181.0], [35.5, 181.0], [35.6, 181.0], [35.7, 181.0], [35.8, 181.0], [35.9, 181.0], [36.0, 181.0], [36.1, 181.0], [36.2, 181.0], [36.3, 181.0], [36.4, 181.0], [36.5, 181.0], [36.6, 181.0], [36.7, 181.0], [36.8, 181.0], [36.9, 181.0], [37.0, 181.0], [37.1, 181.0], [37.2, 181.0], [37.3, 181.0], [37.4, 181.0], [37.5, 181.0], [37.6, 181.0], [37.7, 181.0], [37.8, 181.0], [37.9, 181.0], [38.0, 181.0], [38.1, 181.0], [38.2, 181.0], [38.3, 181.0], [38.4, 181.0], [38.5, 181.0], [38.6, 181.0], [38.7, 182.0], [38.8, 182.0], [38.9, 182.0], [39.0, 182.0], [39.1, 182.0], [39.2, 182.0], [39.3, 182.0], [39.4, 182.0], [39.5, 182.0], [39.6, 182.0], [39.7, 182.0], [39.8, 182.0], [39.9, 182.0], [40.0, 182.0], [40.1, 182.0], [40.2, 182.0], [40.3, 182.0], [40.4, 182.0], [40.5, 182.0], [40.6, 182.0], [40.7, 182.0], [40.8, 182.0], [40.9, 182.0], [41.0, 182.0], [41.1, 182.0], [41.2, 182.0], [41.3, 182.0], [41.4, 182.0], [41.5, 182.0], [41.6, 182.0], [41.7, 182.0], [41.8, 182.0], [41.9, 182.0], [42.0, 182.0], [42.1, 182.0], [42.2, 182.0], [42.3, 182.0], [42.4, 182.0], [42.5, 182.0], [42.6, 183.0], [42.7, 183.0], [42.8, 183.0], [42.9, 183.0], [43.0, 183.0], [43.1, 183.0], [43.2, 183.0], [43.3, 183.0], [43.4, 183.0], [43.5, 183.0], [43.6, 183.0], [43.7, 183.0], [43.8, 183.0], [43.9, 183.0], [44.0, 183.0], [44.1, 183.0], [44.2, 183.0], [44.3, 183.0], [44.4, 183.0], [44.5, 183.0], [44.6, 183.0], [44.7, 183.0], [44.8, 183.0], [44.9, 183.0], [45.0, 183.0], [45.1, 183.0], [45.2, 183.0], [45.3, 183.0], [45.4, 183.0], [45.5, 183.0], [45.6, 183.0], [45.7, 183.0], [45.8, 183.0], [45.9, 183.0], [46.0, 183.0], [46.1, 183.0], [46.2, 183.0], [46.3, 183.0], [46.4, 184.0], [46.5, 184.0], [46.6, 184.0], [46.7, 184.0], [46.8, 184.0], [46.9, 184.0], [47.0, 184.0], [47.1, 184.0], [47.2, 184.0], [47.3, 184.0], [47.4, 184.0], [47.5, 184.0], [47.6, 184.0], [47.7, 184.0], [47.8, 184.0], [47.9, 184.0], [48.0, 184.0], [48.1, 184.0], [48.2, 184.0], [48.3, 184.0], [48.4, 184.0], [48.5, 184.0], [48.6, 184.0], [48.7, 184.0], [48.8, 184.0], [48.9, 184.0], [49.0, 184.0], [49.1, 184.0], [49.2, 184.0], [49.3, 184.0], [49.4, 184.0], [49.5, 184.0], [49.6, 184.0], [49.7, 184.0], [49.8, 184.0], [49.9, 184.0], [50.0, 185.0], [50.1, 185.0], [50.2, 185.0], [50.3, 185.0], [50.4, 185.0], [50.5, 185.0], [50.6, 185.0], [50.7, 185.0], [50.8, 185.0], [50.9, 185.0], [51.0, 185.0], [51.1, 185.0], [51.2, 185.0], [51.3, 185.0], [51.4, 185.0], [51.5, 185.0], [51.6, 185.0], [51.7, 185.0], [51.8, 185.0], [51.9, 185.0], [52.0, 185.0], [52.1, 185.0], [52.2, 185.0], [52.3, 185.0], [52.4, 185.0], [52.5, 185.0], [52.6, 185.0], [52.7, 185.0], [52.8, 185.0], [52.9, 185.0], [53.0, 185.0], [53.1, 185.0], [53.2, 185.0], [53.3, 186.0], [53.4, 186.0], [53.5, 186.0], [53.6, 186.0], [53.7, 186.0], [53.8, 186.0], [53.9, 186.0], [54.0, 186.0], [54.1, 186.0], [54.2, 186.0], [54.3, 186.0], [54.4, 186.0], [54.5, 186.0], [54.6, 186.0], [54.7, 186.0], [54.8, 186.0], [54.9, 186.0], [55.0, 186.0], [55.1, 186.0], [55.2, 186.0], [55.3, 186.0], [55.4, 186.0], [55.5, 186.0], [55.6, 186.0], [55.7, 186.0], [55.8, 186.0], [55.9, 186.0], [56.0, 186.0], [56.1, 186.0], [56.2, 186.0], [56.3, 186.0], [56.4, 186.0], [56.5, 186.0], [56.6, 187.0], [56.7, 187.0], [56.8, 187.0], [56.9, 187.0], [57.0, 187.0], [57.1, 187.0], [57.2, 187.0], [57.3, 187.0], [57.4, 187.0], [57.5, 187.0], [57.6, 187.0], [57.7, 187.0], [57.8, 187.0], [57.9, 187.0], [58.0, 187.0], [58.1, 187.0], [58.2, 187.0], [58.3, 187.0], [58.4, 187.0], [58.5, 187.0], [58.6, 187.0], [58.7, 187.0], [58.8, 187.0], [58.9, 187.0], [59.0, 187.0], [59.1, 187.0], [59.2, 187.0], [59.3, 187.0], [59.4, 187.0], [59.5, 188.0], [59.6, 188.0], [59.7, 188.0], [59.8, 188.0], [59.9, 188.0], [60.0, 188.0], [60.1, 188.0], [60.2, 188.0], [60.3, 188.0], [60.4, 188.0], [60.5, 188.0], [60.6, 188.0], [60.7, 188.0], [60.8, 188.0], [60.9, 188.0], [61.0, 188.0], [61.1, 188.0], [61.2, 188.0], [61.3, 188.0], [61.4, 188.0], [61.5, 188.0], [61.6, 188.0], [61.7, 188.0], [61.8, 188.0], [61.9, 188.0], [62.0, 188.0], [62.1, 189.0], [62.2, 189.0], [62.3, 189.0], [62.4, 189.0], [62.5, 189.0], [62.6, 189.0], [62.7, 189.0], [62.8, 189.0], [62.9, 189.0], [63.0, 189.0], [63.1, 189.0], [63.2, 189.0], [63.3, 189.0], [63.4, 189.0], [63.5, 189.0], [63.6, 189.0], [63.7, 189.0], [63.8, 189.0], [63.9, 189.0], [64.0, 189.0], [64.1, 189.0], [64.2, 189.0], [64.3, 189.0], [64.4, 190.0], [64.5, 190.0], [64.6, 190.0], [64.7, 190.0], [64.8, 190.0], [64.9, 190.0], [65.0, 190.0], [65.1, 190.0], [65.2, 190.0], [65.3, 190.0], [65.4, 190.0], [65.5, 190.0], [65.6, 190.0], [65.7, 190.0], [65.8, 190.0], [65.9, 190.0], [66.0, 190.0], [66.1, 190.0], [66.2, 190.0], [66.3, 190.0], [66.4, 190.0], [66.5, 191.0], [66.6, 191.0], [66.7, 191.0], [66.8, 191.0], [66.9, 191.0], [67.0, 191.0], [67.1, 191.0], [67.2, 191.0], [67.3, 191.0], [67.4, 191.0], [67.5, 191.0], [67.6, 191.0], [67.7, 191.0], [67.8, 191.0], [67.9, 191.0], [68.0, 191.0], [68.1, 191.0], [68.2, 191.0], [68.3, 191.0], [68.4, 192.0], [68.5, 192.0], [68.6, 192.0], [68.7, 192.0], [68.8, 192.0], [68.9, 192.0], [69.0, 192.0], [69.1, 192.0], [69.2, 192.0], [69.3, 192.0], [69.4, 192.0], [69.5, 192.0], [69.6, 192.0], [69.7, 192.0], [69.8, 192.0], [69.9, 192.0], [70.0, 193.0], [70.1, 193.0], [70.2, 193.0], [70.3, 193.0], [70.4, 193.0], [70.5, 193.0], [70.6, 193.0], [70.7, 193.0], [70.8, 193.0], [70.9, 193.0], [71.0, 193.0], [71.1, 193.0], [71.2, 193.0], [71.3, 193.0], [71.4, 193.0], [71.5, 194.0], [71.6, 194.0], [71.7, 194.0], [71.8, 194.0], [71.9, 194.0], [72.0, 194.0], [72.1, 194.0], [72.2, 194.0], [72.3, 194.0], [72.4, 194.0], [72.5, 194.0], [72.6, 194.0], [72.7, 194.0], [72.8, 195.0], [72.9, 195.0], [73.0, 195.0], [73.1, 195.0], [73.2, 195.0], [73.3, 195.0], [73.4, 195.0], [73.5, 195.0], [73.6, 195.0], [73.7, 195.0], [73.8, 195.0], [73.9, 195.0], [74.0, 196.0], [74.1, 196.0], [74.2, 196.0], [74.3, 196.0], [74.4, 196.0], [74.5, 196.0], [74.6, 196.0], [74.7, 196.0], [74.8, 196.0], [74.9, 196.0], [75.0, 197.0], [75.1, 197.0], [75.2, 197.0], [75.3, 197.0], [75.4, 197.0], [75.5, 197.0], [75.6, 197.0], [75.7, 197.0], [75.8, 197.0], [75.9, 197.0], [76.0, 198.0], [76.1, 198.0], [76.2, 198.0], [76.3, 198.0], [76.4, 198.0], [76.5, 198.0], [76.6, 198.0], [76.7, 198.0], [76.8, 199.0], [76.9, 199.0], [77.0, 199.0], [77.1, 199.0], [77.2, 199.0], [77.3, 199.0], [77.4, 199.0], [77.5, 200.0], [77.6, 200.0], [77.7, 200.0], [77.8, 200.0], [77.9, 200.0], [78.0, 200.0], [78.1, 200.0], [78.2, 201.0], [78.3, 201.0], [78.4, 201.0], [78.5, 201.0], [78.6, 201.0], [78.7, 201.0], [78.8, 202.0], [78.9, 202.0], [79.0, 202.0], [79.1, 202.0], [79.2, 202.0], [79.3, 202.0], [79.4, 203.0], [79.5, 203.0], [79.6, 203.0], [79.7, 203.0], [79.8, 203.0], [79.9, 203.0], [80.0, 204.0], [80.1, 204.0], [80.2, 204.0], [80.3, 204.0], [80.4, 204.0], [80.5, 205.0], [80.6, 205.0], [80.7, 205.0], [80.8, 205.0], [80.9, 205.0], [81.0, 205.0], [81.1, 206.0], [81.2, 206.0], [81.3, 206.0], [81.4, 206.0], [81.5, 206.0], [81.6, 207.0], [81.7, 207.0], [81.8, 207.0], [81.9, 207.0], [82.0, 207.0], [82.1, 208.0], [82.2, 208.0], [82.3, 208.0], [82.4, 208.0], [82.5, 209.0], [82.6, 209.0], [82.7, 209.0], [82.8, 209.0], [82.9, 209.0], [83.0, 210.0], [83.1, 210.0], [83.2, 210.0], [83.3, 210.0], [83.4, 211.0], [83.5, 211.0], [83.6, 211.0], [83.7, 211.0], [83.8, 211.0], [83.9, 212.0], [84.0, 212.0], [84.1, 212.0], [84.2, 212.0], [84.3, 212.0], [84.4, 213.0], [84.5, 213.0], [84.6, 213.0], [84.7, 213.0], [84.8, 214.0], [84.9, 214.0], [85.0, 214.0], [85.1, 214.0], [85.2, 215.0], [85.3, 215.0], [85.4, 215.0], [85.5, 215.0], [85.6, 216.0], [85.7, 216.0], [85.8, 216.0], [85.9, 217.0], [86.0, 217.0], [86.1, 217.0], [86.2, 217.0], [86.3, 218.0], [86.4, 218.0], [86.5, 218.0], [86.6, 218.0], [86.7, 219.0], [86.8, 219.0], [86.9, 219.0], [87.0, 220.0], [87.1, 220.0], [87.2, 220.0], [87.3, 221.0], [87.4, 221.0], [87.5, 221.0], [87.6, 222.0], [87.7, 222.0], [87.8, 222.0], [87.9, 222.0], [88.0, 223.0], [88.1, 223.0], [88.2, 223.0], [88.3, 223.0], [88.4, 224.0], [88.5, 224.0], [88.6, 224.0], [88.7, 225.0], [88.8, 225.0], [88.9, 226.0], [89.0, 226.0], [89.1, 226.0], [89.2, 227.0], [89.3, 227.0], [89.4, 228.0], [89.5, 228.0], [89.6, 228.0], [89.7, 229.0], [89.8, 229.0], [89.9, 230.0], [90.0, 230.0], [90.1, 231.0], [90.2, 231.0], [90.3, 232.0], [90.4, 232.0], [90.5, 233.0], [90.6, 233.0], [90.7, 234.0], [90.8, 234.0], [90.9, 235.0], [91.0, 235.0], [91.1, 236.0], [91.2, 236.0], [91.3, 237.0], [91.4, 237.0], [91.5, 237.0], [91.6, 238.0], [91.7, 238.0], [91.8, 239.0], [91.9, 239.0], [92.0, 239.0], [92.1, 240.0], [92.2, 240.0], [92.3, 240.0], [92.4, 241.0], [92.5, 242.0], [92.6, 242.0], [92.7, 243.0], [92.8, 243.0], [92.9, 244.0], [93.0, 244.0], [93.1, 245.0], [93.2, 245.0], [93.3, 246.0], [93.4, 246.0], [93.5, 247.0], [93.6, 247.0], [93.7, 248.0], [93.8, 248.0], [93.9, 248.0], [94.0, 249.0], [94.1, 250.0], [94.2, 250.0], [94.3, 251.0], [94.4, 251.0], [94.5, 252.0], [94.6, 252.0], [94.7, 253.0], [94.8, 254.0], [94.9, 254.0], [95.0, 255.0], [95.1, 256.0], [95.2, 256.0], [95.3, 257.0], [95.4, 258.0], [95.5, 258.0], [95.6, 259.0], [95.7, 260.0], [95.8, 262.0], [95.9, 263.0], [96.0, 264.0], [96.1, 266.0], [96.2, 269.0], [96.3, 271.0], [96.4, 275.0], [96.5, 277.0], [96.6, 279.0], [96.7, 285.0], [96.8, 292.0], [96.9, 306.0], [97.0, 320.0], [97.1, 329.0], [97.2, 366.0], [97.3, 387.0], [97.4, 449.0], [97.5, 506.0], [97.6, 520.0], [97.7, 592.0], [97.8, 678.0], [97.9, 733.0], [98.0, 903.0], [98.1, 1133.0], [98.2, 1674.0], [98.3, 2001.0], [98.4, 2001.0], [98.5, 2001.0], [98.6, 2002.0], [98.7, 2002.0], [98.8, 2002.0], [98.9, 2002.0], [99.0, 2003.0], [99.1, 2003.0], [99.2, 2003.0], [99.3, 2004.0], [99.4, 2004.0], [99.5, 2005.0], [99.6, 2006.0], [99.7, 2007.0], [99.8, 2008.0], [99.9, 2012.0], [100.0, 2035.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
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
        data: {"result": {"minY": 1.0, "minX": 0.0, "maxY": 142335.0, "series": [{"data": [[0.0, 21707.0], [600.0, 211.0], [700.0, 253.0], [200.0, 41058.0], [800.0, 99.0], [900.0, 125.0], [1000.0, 65.0], [1100.0, 138.0], [300.0, 986.0], [1200.0, 26.0], [400.0, 298.0], [100.0, 142335.0], [1600.0, 134.0], [1800.0, 1.0], [1900.0, 1.0], [500.0, 556.0], [2000.0, 3748.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 2000.0, "title": "Response Time Distribution"}},
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
        data: {"result": {"minY": 134.0, "minX": 0.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 184691.0, "series": [{"data": [[0.0, 184691.0]], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [[1.0, 1309.0]], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 134.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [[3.0, 25607.0]], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 3.0, "title": "Synthetic Response Times Distribution"}},
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
        data: {"result": {"minY": 149.36843293013186, "minX": 1.76265024E12, "maxY": 150.0, "series": [{"data": [[1.76265048E12, 150.0], [1.76265054E12, 149.36843293013186], [1.76265036E12, 150.0], [1.76265042E12, 150.0], [1.76265024E12, 149.84503022162556], [1.7626503E12, 150.0]], "isOverall": false, "label": "Thread Group", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76265054E12, "title": "Active Threads Over Time"}},
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
        data: {"result": {"minY": 1.0, "minX": 1.0, "maxY": 478.7727272727273, "series": [{"data": [[2.0, 3.0], [6.0, 6.333333333333333], [7.0, 1.0], [11.0, 9.4], [17.0, 7.5], [18.0, 10.0], [20.0, 6.0], [21.0, 5.5], [22.0, 8.0], [24.0, 5.5], [25.0, 13.0], [26.0, 13.0], [27.0, 14.0], [29.0, 4.5], [30.0, 9.0], [31.0, 11.5], [32.0, 5.0], [35.0, 7.5], [34.0, 11.0], [36.0, 16.0], [38.0, 12.5], [40.0, 17.0], [43.0, 9.0], [45.0, 10.0], [44.0, 2.0], [47.0, 18.0], [49.0, 5.0], [52.0, 11.0], [54.0, 5.8], [58.0, 12.0], [61.0, 8.25], [60.0, 9.75], [63.0, 5.0], [62.0, 25.0], [66.0, 14.5], [65.0, 11.0], [71.0, 11.0], [70.0, 14.0], [69.0, 10.0], [68.0, 13.5], [73.0, 12.5], [79.0, 10.0], [77.0, 19.0], [76.0, 11.5], [83.0, 6.0], [82.0, 4.333333333333333], [81.0, 7.0], [80.0, 7.0], [87.0, 5.0], [86.0, 5.0], [85.0, 13.0], [84.0, 13.0], [90.0, 25.0], [89.0, 11.0], [88.0, 11.0], [92.0, 383.77272727272725], [94.0, 478.7727272727273], [95.0, 14.5], [93.0, 16.333333333333332], [99.0, 7.5], [98.0, 9.0], [97.0, 9.0], [96.0, 15.0], [101.0, 469.5624999999999], [100.0, 13.0], [105.0, 261.2727272727273], [106.0, 209.5], [107.0, 243.625], [104.0, 12.333333333333334], [111.0, 13.25], [110.0, 28.0], [109.0, 11.0], [108.0, 13.0], [115.0, 136.0], [114.0, 15.25], [112.0, 8.333333333333334], [119.0, 196.8], [118.0, 15.0], [117.0, 13.0], [116.0, 14.75], [120.0, 182.24999999999997], [123.0, 9.0], [122.0, 11.5], [121.0, 7.0], [127.0, 86.16666666666669], [126.0, 10.5], [124.0, 14.0], [128.0, 181.55555555555554], [131.0, 223.34615384615384], [132.0, 158.5], [135.0, 5.0], [134.0, 9.5], [130.0, 14.0], [129.0, 17.5], [138.0, 176.53846153846155], [143.0, 154.3333333333333], [142.0, 10.5], [140.0, 12.75], [139.0, 11.105263157894736], [137.0, 16.0], [136.0, 10.0], [144.0, 189.29166666666666], [145.0, 179.125], [150.0, 212.29355440277195], [148.0, 11.333333333333334], [147.0, 10.888888888888891], [146.0, 12.0], [1.0, 4.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}, {"data": [[149.9034008529264, 212.13337048564188]], "isOverall": false, "label": "JSR223 Sampler-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 150.0, "title": "Time VS Threads"}},
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
        data : {"result": {"minY": 0.0, "minX": 1.76265024E12, "maxY": 4.9E-324, "series": [{"data": [[1.76265048E12, 0.0], [1.76265054E12, 0.0], [1.76265036E12, 0.0], [1.76265042E12, 0.0], [1.76265024E12, 0.0], [1.7626503E12, 0.0]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.76265048E12, 0.0], [1.76265054E12, 0.0], [1.76265036E12, 0.0], [1.76265042E12, 0.0], [1.76265024E12, 0.0], [1.7626503E12, 0.0]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76265054E12, "title": "Bytes Throughput Over Time"}},
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
        data: {"result": {"minY": 45.298925798880894, "minX": 1.76265024E12, "maxY": 1083.1494252873563, "series": [{"data": [[1.76265048E12, 1083.1494252873563], [1.76265054E12, 45.298925798880894], [1.76265036E12, 192.41237488236794], [1.76265042E12, 193.3905807061237], [1.76265024E12, 190.93986855991494], [1.7626503E12, 194.33622700181374]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76265054E12, "title": "Response Time Over Time"}},
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
        data: {"result": {"minY": 0.0, "minX": 1.76265024E12, "maxY": 4.9E-324, "series": [{"data": [[1.76265048E12, 0.0], [1.76265054E12, 0.0], [1.76265036E12, 0.0], [1.76265042E12, 0.0], [1.76265024E12, 0.0], [1.7626503E12, 0.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76265054E12, "title": "Latencies Over Time"}},
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
        data: {"result": {"minY": 0.0, "minX": 1.76265024E12, "maxY": 4.9E-324, "series": [{"data": [[1.76265048E12, 0.0], [1.76265054E12, 0.0], [1.76265036E12, 0.0], [1.76265042E12, 0.0], [1.76265024E12, 0.0], [1.7626503E12, 0.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76265054E12, "title": "Connect Time Over Time"}},
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
        data: {"result": {"minY": 163.0, "minX": 1.76265024E12, "maxY": 1678.0, "series": [{"data": [[1.76265048E12, 1678.0], [1.76265036E12, 332.0], [1.76265042E12, 337.0], [1.76265024E12, 708.0], [1.7626503E12, 397.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.76265048E12, 167.0], [1.76265036E12, 164.0], [1.76265042E12, 165.0], [1.76265024E12, 165.0], [1.7626503E12, 163.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.76265048E12, 770.5], [1.76265036E12, 216.0], [1.76265042E12, 221.0], [1.76265024E12, 218.0], [1.7626503E12, 221.0]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.76265048E12, 1675.0], [1.76265036E12, 259.0], [1.76265042E12, 259.0], [1.76265024E12, 256.0], [1.7626503E12, 256.0]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.76265048E12, 279.0], [1.76265036E12, 186.0], [1.76265042E12, 185.0], [1.76265024E12, 184.0], [1.7626503E12, 186.0]], "isOverall": false, "label": "Median", "isController": false}, {"data": [[1.76265048E12, 1144.0], [1.76265036E12, 234.0], [1.76265042E12, 241.0], [1.76265024E12, 236.0], [1.7626503E12, 237.95000000000073]], "isOverall": false, "label": "95th percentile", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76265048E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
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
    data: {"result": {"minY": 11.0, "minX": 1.0, "maxY": 2005.0, "series": [{"data": [[16.0, 598.5], [56.0, 456.0], [150.0, 841.0], [181.0, 539.0], [258.0, 1670.5], [300.0, 510.0], [352.0, 397.0], [379.0, 448.0], [535.0, 279.0], [561.0, 256.0], [580.0, 243.5], [592.0, 252.0], [601.0, 233.0], [618.0, 222.0], [665.0, 188.0], [640.0, 214.0], [652.0, 230.0], [685.0, 200.0], [696.0, 180.5], [695.0, 193.0], [712.0, 213.0], [726.0, 207.0], [730.0, 189.0], [714.0, 211.0], [716.0, 211.0], [704.0, 201.0], [729.0, 186.0], [761.0, 188.0], [767.0, 184.0], [766.0, 186.0], [764.0, 192.0], [752.0, 186.0], [753.0, 188.0], [754.0, 185.0], [743.0, 191.0], [741.0, 196.0], [742.0, 202.0], [740.0, 196.0], [748.0, 187.0], [749.0, 190.0], [747.0, 187.0], [746.0, 188.0], [744.0, 185.0], [745.0, 190.0], [750.0, 197.0], [751.0, 198.0], [756.0, 188.0], [738.0, 188.0], [760.0, 186.0], [755.0, 188.0], [758.0, 190.0], [757.0, 186.0], [793.0, 184.0], [780.0, 182.0], [779.0, 184.0], [777.0, 190.0], [778.0, 183.0], [794.0, 184.0], [798.0, 184.5], [799.0, 186.0], [796.0, 183.0], [797.0, 181.0], [795.0, 186.0], [791.0, 182.0], [790.0, 185.0], [789.0, 184.0], [784.0, 184.0], [786.0, 186.0], [785.0, 186.0], [787.0, 182.0], [773.0, 184.0], [775.0, 185.0], [792.0, 184.0], [774.0, 184.0], [788.0, 184.0], [771.0, 186.0], [781.0, 184.0], [768.0, 186.0], [783.0, 184.0], [769.0, 188.0], [770.0, 186.0], [803.0, 185.0], [804.0, 180.0], [806.0, 184.0], [805.0, 185.0], [826.0, 185.0], [825.0, 182.0], [807.0, 187.0], [827.0, 183.0], [829.0, 185.0], [816.0, 186.0], [819.0, 184.0], [817.0, 181.0], [809.0, 183.0], [801.0, 183.0], [811.0, 182.0], [812.0, 185.0], [813.0, 183.0], [800.0, 180.0], [810.0, 181.0], [802.0, 184.0], [823.0, 182.0], [822.0, 182.0], [820.0, 185.0], [854.0, 182.0], [832.0, 182.0], [843.0, 185.0], [834.0, 186.0], [839.0, 183.0], [863.0, 182.0], [864.0, 179.0]], "isOverall": false, "label": "Successes", "isController": false}, {"data": [[1.0, 2003.0], [150.0, 2003.0], [151.0, 2005.0], [149.0, 2003.0], [11722.0, 13.0], [6335.0, 11.0], [3799.0, 13.0]], "isOverall": false, "label": "Failures", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 11722.0, "title": "Response Time Vs Request"}},
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
    data: {"result": {"minY": 0.0, "minX": 1.0, "maxY": 4.9E-324, "series": [{"data": [[16.0, 0.0], [56.0, 0.0], [150.0, 0.0], [181.0, 0.0], [258.0, 0.0], [300.0, 0.0], [352.0, 0.0], [379.0, 0.0], [535.0, 0.0], [561.0, 0.0], [580.0, 0.0], [592.0, 0.0], [601.0, 0.0], [618.0, 0.0], [665.0, 0.0], [640.0, 0.0], [652.0, 0.0], [685.0, 0.0], [696.0, 0.0], [695.0, 0.0], [712.0, 0.0], [726.0, 0.0], [730.0, 0.0], [714.0, 0.0], [716.0, 0.0], [704.0, 0.0], [729.0, 0.0], [761.0, 0.0], [767.0, 0.0], [766.0, 0.0], [764.0, 0.0], [752.0, 0.0], [753.0, 0.0], [754.0, 0.0], [743.0, 0.0], [741.0, 0.0], [742.0, 0.0], [740.0, 0.0], [748.0, 0.0], [749.0, 0.0], [747.0, 0.0], [746.0, 0.0], [744.0, 0.0], [745.0, 0.0], [750.0, 0.0], [751.0, 0.0], [756.0, 0.0], [738.0, 0.0], [760.0, 0.0], [755.0, 0.0], [758.0, 0.0], [757.0, 0.0], [793.0, 0.0], [780.0, 0.0], [779.0, 0.0], [777.0, 0.0], [778.0, 0.0], [794.0, 0.0], [798.0, 0.0], [799.0, 0.0], [796.0, 0.0], [797.0, 0.0], [795.0, 0.0], [791.0, 0.0], [790.0, 0.0], [789.0, 0.0], [784.0, 0.0], [786.0, 0.0], [785.0, 0.0], [787.0, 0.0], [773.0, 0.0], [775.0, 0.0], [792.0, 0.0], [774.0, 0.0], [788.0, 0.0], [771.0, 0.0], [781.0, 0.0], [768.0, 0.0], [783.0, 0.0], [769.0, 0.0], [770.0, 0.0], [803.0, 0.0], [804.0, 0.0], [806.0, 0.0], [805.0, 0.0], [826.0, 0.0], [825.0, 0.0], [807.0, 0.0], [827.0, 0.0], [829.0, 0.0], [816.0, 0.0], [819.0, 0.0], [817.0, 0.0], [809.0, 0.0], [801.0, 0.0], [811.0, 0.0], [812.0, 0.0], [813.0, 0.0], [800.0, 0.0], [810.0, 0.0], [802.0, 0.0], [823.0, 0.0], [822.0, 0.0], [820.0, 0.0], [854.0, 0.0], [832.0, 0.0], [843.0, 0.0], [834.0, 0.0], [839.0, 0.0], [863.0, 0.0], [864.0, 0.0]], "isOverall": false, "label": "Successes", "isController": false}, {"data": [[1.0, 0.0], [150.0, 0.0], [151.0, 0.0], [149.0, 0.0], [11722.0, 0.0], [6335.0, 0.0], [3799.0, 0.0]], "isOverall": false, "label": "Failures", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 11722.0, "title": "Latencies Vs Request"}},
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
        data: {"result": {"minY": 137.75, "minX": 1.76265024E12, "maxY": 779.2666666666667, "series": [{"data": [[1.76265048E12, 137.75], [1.76265054E12, 366.76666666666665], [1.76265036E12, 779.2666666666667], [1.76265042E12, 776.0666666666667], [1.76265024E12, 697.3666666666667], [1.7626503E12, 771.8]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76265054E12, "title": "Hits Per Second"}},
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
        data: {"result": {"minY": 57.516666666666666, "minX": 1.76265024E12, "maxY": 779.2666666666667, "series": [{"data": [[1.76265048E12, 80.23333333333333], [1.76265036E12, 779.2666666666667], [1.76265042E12, 776.0666666666667], [1.76265024E12, 694.8666666666667], [1.7626503E12, 771.8]], "isOverall": false, "label": "200", "isController": false}, {"data": [[1.76265048E12, 57.516666666666666], [1.76265054E12, 369.26666666666665]], "isOverall": false, "label": "500", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76265054E12, "title": "Codes Per Second"}},
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
        data: {"result": {"minY": 57.516666666666666, "minX": 1.76265024E12, "maxY": 779.2666666666667, "series": [{"data": [[1.76265048E12, 57.516666666666666], [1.76265054E12, 369.26666666666665]], "isOverall": false, "label": "JSR223 Sampler-failure", "isController": false}, {"data": [[1.76265048E12, 80.23333333333333], [1.76265036E12, 779.2666666666667], [1.76265042E12, 776.0666666666667], [1.76265024E12, 694.8666666666667], [1.7626503E12, 771.8]], "isOverall": false, "label": "JSR223 Sampler-success", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76265054E12, "title": "Transactions Per Second"}},
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
        data: {"result": {"minY": 57.516666666666666, "minX": 1.76265024E12, "maxY": 779.2666666666667, "series": [{"data": [[1.76265048E12, 80.23333333333333], [1.76265036E12, 779.2666666666667], [1.76265042E12, 776.0666666666667], [1.76265024E12, 694.8666666666667], [1.7626503E12, 771.8]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [[1.76265048E12, 57.516666666666666], [1.76265054E12, 369.26666666666665]], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76265054E12, "title": "Total Transactions Per Second"}},
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

