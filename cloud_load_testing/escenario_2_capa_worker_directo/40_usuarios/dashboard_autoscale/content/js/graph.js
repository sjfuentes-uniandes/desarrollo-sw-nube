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
        data: {"result": {"minY": 161.0, "minX": 0.0, "maxY": 681.0, "series": [{"data": [[0.0, 161.0], [0.1, 165.0], [0.2, 166.0], [0.3, 167.0], [0.4, 167.0], [0.5, 168.0], [0.6, 168.0], [0.7, 168.0], [0.8, 168.0], [0.9, 168.0], [1.0, 168.0], [1.1, 169.0], [1.2, 169.0], [1.3, 169.0], [1.4, 169.0], [1.5, 169.0], [1.6, 169.0], [1.7, 169.0], [1.8, 169.0], [1.9, 169.0], [2.0, 170.0], [2.1, 170.0], [2.2, 170.0], [2.3, 170.0], [2.4, 170.0], [2.5, 170.0], [2.6, 170.0], [2.7, 170.0], [2.8, 170.0], [2.9, 170.0], [3.0, 170.0], [3.1, 170.0], [3.2, 170.0], [3.3, 170.0], [3.4, 170.0], [3.5, 171.0], [3.6, 171.0], [3.7, 171.0], [3.8, 171.0], [3.9, 171.0], [4.0, 171.0], [4.1, 171.0], [4.2, 171.0], [4.3, 171.0], [4.4, 171.0], [4.5, 171.0], [4.6, 171.0], [4.7, 171.0], [4.8, 171.0], [4.9, 171.0], [5.0, 171.0], [5.1, 171.0], [5.2, 171.0], [5.3, 171.0], [5.4, 171.0], [5.5, 172.0], [5.6, 172.0], [5.7, 172.0], [5.8, 172.0], [5.9, 172.0], [6.0, 172.0], [6.1, 172.0], [6.2, 172.0], [6.3, 172.0], [6.4, 172.0], [6.5, 172.0], [6.6, 172.0], [6.7, 172.0], [6.8, 172.0], [6.9, 172.0], [7.0, 172.0], [7.1, 172.0], [7.2, 172.0], [7.3, 172.0], [7.4, 172.0], [7.5, 172.0], [7.6, 172.0], [7.7, 172.0], [7.8, 172.0], [7.9, 172.0], [8.0, 173.0], [8.1, 173.0], [8.2, 173.0], [8.3, 173.0], [8.4, 173.0], [8.5, 173.0], [8.6, 173.0], [8.7, 173.0], [8.8, 173.0], [8.9, 173.0], [9.0, 173.0], [9.1, 173.0], [9.2, 173.0], [9.3, 173.0], [9.4, 173.0], [9.5, 173.0], [9.6, 173.0], [9.7, 173.0], [9.8, 173.0], [9.9, 173.0], [10.0, 173.0], [10.1, 173.0], [10.2, 173.0], [10.3, 173.0], [10.4, 173.0], [10.5, 173.0], [10.6, 173.0], [10.7, 173.0], [10.8, 173.0], [10.9, 174.0], [11.0, 174.0], [11.1, 174.0], [11.2, 174.0], [11.3, 174.0], [11.4, 174.0], [11.5, 174.0], [11.6, 174.0], [11.7, 174.0], [11.8, 174.0], [11.9, 174.0], [12.0, 174.0], [12.1, 174.0], [12.2, 174.0], [12.3, 174.0], [12.4, 174.0], [12.5, 174.0], [12.6, 174.0], [12.7, 174.0], [12.8, 174.0], [12.9, 174.0], [13.0, 174.0], [13.1, 174.0], [13.2, 174.0], [13.3, 174.0], [13.4, 174.0], [13.5, 174.0], [13.6, 174.0], [13.7, 174.0], [13.8, 174.0], [13.9, 174.0], [14.0, 175.0], [14.1, 175.0], [14.2, 175.0], [14.3, 175.0], [14.4, 175.0], [14.5, 175.0], [14.6, 175.0], [14.7, 175.0], [14.8, 175.0], [14.9, 175.0], [15.0, 175.0], [15.1, 175.0], [15.2, 175.0], [15.3, 175.0], [15.4, 175.0], [15.5, 175.0], [15.6, 175.0], [15.7, 175.0], [15.8, 175.0], [15.9, 175.0], [16.0, 175.0], [16.1, 175.0], [16.2, 175.0], [16.3, 175.0], [16.4, 175.0], [16.5, 175.0], [16.6, 175.0], [16.7, 175.0], [16.8, 175.0], [16.9, 175.0], [17.0, 175.0], [17.1, 175.0], [17.2, 175.0], [17.3, 175.0], [17.4, 175.0], [17.5, 175.0], [17.6, 176.0], [17.7, 176.0], [17.8, 176.0], [17.9, 176.0], [18.0, 176.0], [18.1, 176.0], [18.2, 176.0], [18.3, 176.0], [18.4, 176.0], [18.5, 176.0], [18.6, 176.0], [18.7, 176.0], [18.8, 176.0], [18.9, 176.0], [19.0, 176.0], [19.1, 176.0], [19.2, 176.0], [19.3, 176.0], [19.4, 176.0], [19.5, 176.0], [19.6, 176.0], [19.7, 176.0], [19.8, 176.0], [19.9, 176.0], [20.0, 176.0], [20.1, 176.0], [20.2, 176.0], [20.3, 176.0], [20.4, 176.0], [20.5, 176.0], [20.6, 176.0], [20.7, 176.0], [20.8, 176.0], [20.9, 176.0], [21.0, 176.0], [21.1, 177.0], [21.2, 177.0], [21.3, 177.0], [21.4, 177.0], [21.5, 177.0], [21.6, 177.0], [21.7, 177.0], [21.8, 177.0], [21.9, 177.0], [22.0, 177.0], [22.1, 177.0], [22.2, 177.0], [22.3, 177.0], [22.4, 177.0], [22.5, 177.0], [22.6, 177.0], [22.7, 177.0], [22.8, 177.0], [22.9, 177.0], [23.0, 177.0], [23.1, 177.0], [23.2, 177.0], [23.3, 177.0], [23.4, 177.0], [23.5, 177.0], [23.6, 177.0], [23.7, 177.0], [23.8, 177.0], [23.9, 177.0], [24.0, 177.0], [24.1, 177.0], [24.2, 177.0], [24.3, 177.0], [24.4, 177.0], [24.5, 177.0], [24.6, 178.0], [24.7, 178.0], [24.8, 178.0], [24.9, 178.0], [25.0, 178.0], [25.1, 178.0], [25.2, 178.0], [25.3, 178.0], [25.4, 178.0], [25.5, 178.0], [25.6, 178.0], [25.7, 178.0], [25.8, 178.0], [25.9, 178.0], [26.0, 178.0], [26.1, 178.0], [26.2, 178.0], [26.3, 178.0], [26.4, 178.0], [26.5, 178.0], [26.6, 178.0], [26.7, 178.0], [26.8, 178.0], [26.9, 178.0], [27.0, 178.0], [27.1, 178.0], [27.2, 178.0], [27.3, 178.0], [27.4, 178.0], [27.5, 178.0], [27.6, 178.0], [27.7, 178.0], [27.8, 178.0], [27.9, 179.0], [28.0, 179.0], [28.1, 179.0], [28.2, 179.0], [28.3, 179.0], [28.4, 179.0], [28.5, 179.0], [28.6, 179.0], [28.7, 179.0], [28.8, 179.0], [28.9, 179.0], [29.0, 179.0], [29.1, 179.0], [29.2, 179.0], [29.3, 179.0], [29.4, 179.0], [29.5, 179.0], [29.6, 179.0], [29.7, 179.0], [29.8, 179.0], [29.9, 179.0], [30.0, 179.0], [30.1, 179.0], [30.2, 179.0], [30.3, 179.0], [30.4, 179.0], [30.5, 179.0], [30.6, 179.0], [30.7, 179.0], [30.8, 179.0], [30.9, 180.0], [31.0, 180.0], [31.1, 180.0], [31.2, 180.0], [31.3, 180.0], [31.4, 180.0], [31.5, 180.0], [31.6, 180.0], [31.7, 180.0], [31.8, 180.0], [31.9, 180.0], [32.0, 180.0], [32.1, 180.0], [32.2, 180.0], [32.3, 180.0], [32.4, 180.0], [32.5, 180.0], [32.6, 180.0], [32.7, 180.0], [32.8, 180.0], [32.9, 180.0], [33.0, 180.0], [33.1, 180.0], [33.2, 180.0], [33.3, 180.0], [33.4, 180.0], [33.5, 180.0], [33.6, 181.0], [33.7, 181.0], [33.8, 181.0], [33.9, 181.0], [34.0, 181.0], [34.1, 181.0], [34.2, 181.0], [34.3, 181.0], [34.4, 181.0], [34.5, 181.0], [34.6, 181.0], [34.7, 181.0], [34.8, 181.0], [34.9, 181.0], [35.0, 181.0], [35.1, 181.0], [35.2, 181.0], [35.3, 181.0], [35.4, 181.0], [35.5, 181.0], [35.6, 181.0], [35.7, 181.0], [35.8, 182.0], [35.9, 182.0], [36.0, 182.0], [36.1, 182.0], [36.2, 182.0], [36.3, 182.0], [36.4, 182.0], [36.5, 182.0], [36.6, 182.0], [36.7, 182.0], [36.8, 182.0], [36.9, 182.0], [37.0, 182.0], [37.1, 182.0], [37.2, 182.0], [37.3, 182.0], [37.4, 182.0], [37.5, 182.0], [37.6, 183.0], [37.7, 183.0], [37.8, 183.0], [37.9, 183.0], [38.0, 183.0], [38.1, 183.0], [38.2, 183.0], [38.3, 183.0], [38.4, 183.0], [38.5, 183.0], [38.6, 183.0], [38.7, 183.0], [38.8, 183.0], [38.9, 183.0], [39.0, 183.0], [39.1, 183.0], [39.2, 183.0], [39.3, 184.0], [39.4, 184.0], [39.5, 184.0], [39.6, 184.0], [39.7, 184.0], [39.8, 184.0], [39.9, 184.0], [40.0, 184.0], [40.1, 184.0], [40.2, 184.0], [40.3, 184.0], [40.4, 184.0], [40.5, 184.0], [40.6, 185.0], [40.7, 185.0], [40.8, 185.0], [40.9, 185.0], [41.0, 185.0], [41.1, 185.0], [41.2, 185.0], [41.3, 185.0], [41.4, 185.0], [41.5, 185.0], [41.6, 185.0], [41.7, 186.0], [41.8, 186.0], [41.9, 186.0], [42.0, 186.0], [42.1, 186.0], [42.2, 186.0], [42.3, 186.0], [42.4, 186.0], [42.5, 186.0], [42.6, 186.0], [42.7, 187.0], [42.8, 187.0], [42.9, 187.0], [43.0, 187.0], [43.1, 187.0], [43.2, 187.0], [43.3, 187.0], [43.4, 187.0], [43.5, 187.0], [43.6, 188.0], [43.7, 188.0], [43.8, 188.0], [43.9, 188.0], [44.0, 188.0], [44.1, 188.0], [44.2, 188.0], [44.3, 189.0], [44.4, 189.0], [44.5, 189.0], [44.6, 189.0], [44.7, 189.0], [44.8, 189.0], [44.9, 190.0], [45.0, 190.0], [45.1, 190.0], [45.2, 190.0], [45.3, 190.0], [45.4, 190.0], [45.5, 191.0], [45.6, 191.0], [45.7, 191.0], [45.8, 191.0], [45.9, 191.0], [46.0, 192.0], [46.1, 192.0], [46.2, 192.0], [46.3, 192.0], [46.4, 192.0], [46.5, 192.0], [46.6, 193.0], [46.7, 193.0], [46.8, 193.0], [46.9, 193.0], [47.0, 193.0], [47.1, 194.0], [47.2, 194.0], [47.3, 194.0], [47.4, 194.0], [47.5, 194.0], [47.6, 195.0], [47.7, 195.0], [47.8, 195.0], [47.9, 195.0], [48.0, 195.0], [48.1, 196.0], [48.2, 196.0], [48.3, 196.0], [48.4, 196.0], [48.5, 197.0], [48.6, 197.0], [48.7, 197.0], [48.8, 197.0], [48.9, 198.0], [49.0, 198.0], [49.1, 198.0], [49.2, 198.0], [49.3, 198.0], [49.4, 199.0], [49.5, 199.0], [49.6, 199.0], [49.7, 199.0], [49.8, 199.0], [49.9, 200.0], [50.0, 200.0], [50.1, 200.0], [50.2, 200.0], [50.3, 201.0], [50.4, 201.0], [50.5, 201.0], [50.6, 202.0], [50.7, 202.0], [50.8, 202.0], [50.9, 203.0], [51.0, 203.0], [51.1, 203.0], [51.2, 203.0], [51.3, 204.0], [51.4, 204.0], [51.5, 204.0], [51.6, 205.0], [51.7, 205.0], [51.8, 205.0], [51.9, 206.0], [52.0, 206.0], [52.1, 206.0], [52.2, 206.0], [52.3, 207.0], [52.4, 207.0], [52.5, 207.0], [52.6, 208.0], [52.7, 208.0], [52.8, 208.0], [52.9, 209.0], [53.0, 209.0], [53.1, 209.0], [53.2, 210.0], [53.3, 210.0], [53.4, 210.0], [53.5, 211.0], [53.6, 211.0], [53.7, 211.0], [53.8, 211.0], [53.9, 212.0], [54.0, 212.0], [54.1, 212.0], [54.2, 212.0], [54.3, 213.0], [54.4, 213.0], [54.5, 213.0], [54.6, 213.0], [54.7, 214.0], [54.8, 214.0], [54.9, 214.0], [55.0, 215.0], [55.1, 215.0], [55.2, 215.0], [55.3, 215.0], [55.4, 216.0], [55.5, 216.0], [55.6, 216.0], [55.7, 217.0], [55.8, 217.0], [55.9, 217.0], [56.0, 217.0], [56.1, 218.0], [56.2, 218.0], [56.3, 218.0], [56.4, 218.0], [56.5, 219.0], [56.6, 219.0], [56.7, 219.0], [56.8, 219.0], [56.9, 220.0], [57.0, 220.0], [57.1, 220.0], [57.2, 221.0], [57.3, 221.0], [57.4, 221.0], [57.5, 222.0], [57.6, 222.0], [57.7, 222.0], [57.8, 222.0], [57.9, 223.0], [58.0, 223.0], [58.1, 223.0], [58.2, 223.0], [58.3, 224.0], [58.4, 224.0], [58.5, 224.0], [58.6, 225.0], [58.7, 225.0], [58.8, 225.0], [58.9, 225.0], [59.0, 226.0], [59.1, 226.0], [59.2, 226.0], [59.3, 226.0], [59.4, 226.0], [59.5, 227.0], [59.6, 227.0], [59.7, 227.0], [59.8, 227.0], [59.9, 228.0], [60.0, 228.0], [60.1, 228.0], [60.2, 228.0], [60.3, 229.0], [60.4, 229.0], [60.5, 229.0], [60.6, 229.0], [60.7, 230.0], [60.8, 230.0], [60.9, 230.0], [61.0, 230.0], [61.1, 230.0], [61.2, 230.0], [61.3, 231.0], [61.4, 231.0], [61.5, 231.0], [61.6, 231.0], [61.7, 231.0], [61.8, 232.0], [61.9, 232.0], [62.0, 232.0], [62.1, 232.0], [62.2, 232.0], [62.3, 233.0], [62.4, 233.0], [62.5, 233.0], [62.6, 233.0], [62.7, 234.0], [62.8, 234.0], [62.9, 234.0], [63.0, 234.0], [63.1, 234.0], [63.2, 235.0], [63.3, 235.0], [63.4, 235.0], [63.5, 235.0], [63.6, 236.0], [63.7, 236.0], [63.8, 236.0], [63.9, 236.0], [64.0, 236.0], [64.1, 237.0], [64.2, 237.0], [64.3, 237.0], [64.4, 237.0], [64.5, 237.0], [64.6, 237.0], [64.7, 238.0], [64.8, 238.0], [64.9, 238.0], [65.0, 238.0], [65.1, 238.0], [65.2, 238.0], [65.3, 238.0], [65.4, 239.0], [65.5, 239.0], [65.6, 239.0], [65.7, 239.0], [65.8, 239.0], [65.9, 239.0], [66.0, 239.0], [66.1, 239.0], [66.2, 239.0], [66.3, 240.0], [66.4, 240.0], [66.5, 240.0], [66.6, 240.0], [66.7, 240.0], [66.8, 240.0], [66.9, 240.0], [67.0, 240.0], [67.1, 240.0], [67.2, 240.0], [67.3, 240.0], [67.4, 241.0], [67.5, 241.0], [67.6, 241.0], [67.7, 241.0], [67.8, 241.0], [67.9, 241.0], [68.0, 241.0], [68.1, 241.0], [68.2, 241.0], [68.3, 241.0], [68.4, 242.0], [68.5, 242.0], [68.6, 242.0], [68.7, 242.0], [68.8, 242.0], [68.9, 242.0], [69.0, 242.0], [69.1, 242.0], [69.2, 243.0], [69.3, 243.0], [69.4, 243.0], [69.5, 243.0], [69.6, 243.0], [69.7, 243.0], [69.8, 243.0], [69.9, 243.0], [70.0, 243.0], [70.1, 244.0], [70.2, 244.0], [70.3, 244.0], [70.4, 244.0], [70.5, 244.0], [70.6, 244.0], [70.7, 244.0], [70.8, 245.0], [70.9, 245.0], [71.0, 245.0], [71.1, 245.0], [71.2, 245.0], [71.3, 245.0], [71.4, 245.0], [71.5, 245.0], [71.6, 245.0], [71.7, 246.0], [71.8, 246.0], [71.9, 246.0], [72.0, 246.0], [72.1, 246.0], [72.2, 246.0], [72.3, 246.0], [72.4, 247.0], [72.5, 247.0], [72.6, 247.0], [72.7, 247.0], [72.8, 247.0], [72.9, 247.0], [73.0, 247.0], [73.1, 248.0], [73.2, 248.0], [73.3, 248.0], [73.4, 248.0], [73.5, 248.0], [73.6, 248.0], [73.7, 249.0], [73.8, 249.0], [73.9, 249.0], [74.0, 249.0], [74.1, 249.0], [74.2, 249.0], [74.3, 249.0], [74.4, 250.0], [74.5, 250.0], [74.6, 250.0], [74.7, 250.0], [74.8, 250.0], [74.9, 250.0], [75.0, 250.0], [75.1, 250.0], [75.2, 251.0], [75.3, 251.0], [75.4, 251.0], [75.5, 251.0], [75.6, 251.0], [75.7, 251.0], [75.8, 251.0], [75.9, 251.0], [76.0, 252.0], [76.1, 252.0], [76.2, 252.0], [76.3, 252.0], [76.4, 252.0], [76.5, 252.0], [76.6, 252.0], [76.7, 252.0], [76.8, 253.0], [76.9, 253.0], [77.0, 253.0], [77.1, 253.0], [77.2, 253.0], [77.3, 253.0], [77.4, 253.0], [77.5, 253.0], [77.6, 254.0], [77.7, 254.0], [77.8, 254.0], [77.9, 254.0], [78.0, 254.0], [78.1, 254.0], [78.2, 254.0], [78.3, 254.0], [78.4, 254.0], [78.5, 254.0], [78.6, 254.0], [78.7, 255.0], [78.8, 255.0], [78.9, 255.0], [79.0, 255.0], [79.1, 255.0], [79.2, 255.0], [79.3, 255.0], [79.4, 255.0], [79.5, 255.0], [79.6, 255.0], [79.7, 255.0], [79.8, 255.0], [79.9, 256.0], [80.0, 256.0], [80.1, 256.0], [80.2, 256.0], [80.3, 256.0], [80.4, 256.0], [80.5, 256.0], [80.6, 256.0], [80.7, 256.0], [80.8, 256.0], [80.9, 256.0], [81.0, 256.0], [81.1, 256.0], [81.2, 257.0], [81.3, 257.0], [81.4, 257.0], [81.5, 257.0], [81.6, 257.0], [81.7, 257.0], [81.8, 257.0], [81.9, 257.0], [82.0, 257.0], [82.1, 257.0], [82.2, 257.0], [82.3, 257.0], [82.4, 257.0], [82.5, 257.0], [82.6, 258.0], [82.7, 258.0], [82.8, 258.0], [82.9, 258.0], [83.0, 258.0], [83.1, 258.0], [83.2, 258.0], [83.3, 258.0], [83.4, 258.0], [83.5, 258.0], [83.6, 258.0], [83.7, 258.0], [83.8, 258.0], [83.9, 258.0], [84.0, 259.0], [84.1, 259.0], [84.2, 259.0], [84.3, 259.0], [84.4, 259.0], [84.5, 259.0], [84.6, 259.0], [84.7, 259.0], [84.8, 259.0], [84.9, 259.0], [85.0, 259.0], [85.1, 259.0], [85.2, 259.0], [85.3, 259.0], [85.4, 260.0], [85.5, 260.0], [85.6, 260.0], [85.7, 260.0], [85.8, 260.0], [85.9, 260.0], [86.0, 260.0], [86.1, 260.0], [86.2, 260.0], [86.3, 260.0], [86.4, 260.0], [86.5, 260.0], [86.6, 260.0], [86.7, 260.0], [86.8, 261.0], [86.9, 261.0], [87.0, 261.0], [87.1, 261.0], [87.2, 261.0], [87.3, 261.0], [87.4, 261.0], [87.5, 261.0], [87.6, 261.0], [87.7, 261.0], [87.8, 261.0], [87.9, 261.0], [88.0, 261.0], [88.1, 262.0], [88.2, 262.0], [88.3, 262.0], [88.4, 262.0], [88.5, 262.0], [88.6, 262.0], [88.7, 262.0], [88.8, 262.0], [88.9, 262.0], [89.0, 262.0], [89.1, 262.0], [89.2, 262.0], [89.3, 263.0], [89.4, 263.0], [89.5, 263.0], [89.6, 263.0], [89.7, 263.0], [89.8, 263.0], [89.9, 263.0], [90.0, 263.0], [90.1, 263.0], [90.2, 263.0], [90.3, 263.0], [90.4, 264.0], [90.5, 264.0], [90.6, 264.0], [90.7, 264.0], [90.8, 264.0], [90.9, 264.0], [91.0, 264.0], [91.1, 264.0], [91.2, 264.0], [91.3, 264.0], [91.4, 264.0], [91.5, 264.0], [91.6, 265.0], [91.7, 265.0], [91.8, 265.0], [91.9, 265.0], [92.0, 265.0], [92.1, 265.0], [92.2, 265.0], [92.3, 265.0], [92.4, 265.0], [92.5, 265.0], [92.6, 266.0], [92.7, 266.0], [92.8, 266.0], [92.9, 266.0], [93.0, 266.0], [93.1, 266.0], [93.2, 266.0], [93.3, 266.0], [93.4, 266.0], [93.5, 267.0], [93.6, 267.0], [93.7, 267.0], [93.8, 267.0], [93.9, 267.0], [94.0, 267.0], [94.1, 267.0], [94.2, 268.0], [94.3, 268.0], [94.4, 268.0], [94.5, 268.0], [94.6, 268.0], [94.7, 268.0], [94.8, 268.0], [94.9, 269.0], [95.0, 269.0], [95.1, 269.0], [95.2, 269.0], [95.3, 269.0], [95.4, 269.0], [95.5, 270.0], [95.6, 270.0], [95.7, 270.0], [95.8, 271.0], [95.9, 271.0], [96.0, 271.0], [96.1, 272.0], [96.2, 272.0], [96.3, 272.0], [96.4, 273.0], [96.5, 273.0], [96.6, 274.0], [96.7, 274.0], [96.8, 274.0], [96.9, 275.0], [97.0, 275.0], [97.1, 276.0], [97.2, 277.0], [97.3, 278.0], [97.4, 279.0], [97.5, 281.0], [97.6, 284.0], [97.7, 287.0], [97.8, 290.0], [97.9, 293.0], [98.0, 296.0], [98.1, 298.0], [98.2, 300.0], [98.3, 303.0], [98.4, 305.0], [98.5, 308.0], [98.6, 311.0], [98.7, 314.0], [98.8, 316.0], [98.9, 318.0], [99.0, 320.0], [99.1, 321.0], [99.2, 323.0], [99.3, 324.0], [99.4, 325.0], [99.5, 326.0], [99.6, 329.0], [99.7, 331.0], [99.8, 333.0], [99.9, 340.0], [100.0, 681.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
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
        data: {"result": {"minY": 3.0, "minX": 100.0, "maxY": 55957.0, "series": [{"data": [[600.0, 3.0], [300.0, 2034.0], [200.0, 54290.0], [400.0, 4.0], [100.0, 55957.0], [500.0, 5.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 600.0, "title": "Response Time Distribution"}},
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
        data: {"result": {"minY": 8.0, "minX": 0.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 112285.0, "series": [{"data": [[0.0, 112285.0]], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [[1.0, 8.0]], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 1.0, "title": "Synthetic Response Times Distribution"}},
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
        data: {"result": {"minY": 39.77325261419929, "minX": 1.76262408E12, "maxY": 40.0, "series": [{"data": [[1.76262432E12, 40.0], [1.7626245E12, 40.0], [1.7626242E12, 40.0], [1.76262468E12, 39.94050391700191], [1.76262438E12, 40.0], [1.76262408E12, 39.77325261419929], [1.76262456E12, 40.0], [1.76262426E12, 40.0], [1.76262444E12, 40.0], [1.76262414E12, 40.0], [1.76262462E12, 40.0]], "isOverall": false, "label": "Thread Group", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76262468E12, "title": "Active Threads Over Time"}},
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
        data: {"result": {"minY": 172.11111111111114, "minX": 5.0, "maxY": 464.4375, "series": [{"data": [[34.0, 190.55], [35.0, 172.5], [37.0, 181.0], [36.0, 176.33333333333334], [38.0, 208.7], [40.0, 213.48104052115417], [5.0, 298.4], [21.0, 172.11111111111114], [12.0, 224.85714285714286], [25.0, 419.5], [28.0, 464.4375], [31.0, 261.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}, {"data": [[39.99132626254558, 213.51723615897478]], "isOverall": false, "label": "JSR223 Sampler-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 40.0, "title": "Time VS Threads"}},
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
        data : {"result": {"minY": 0.0, "minX": 1.76262408E12, "maxY": 4.9E-324, "series": [{"data": [[1.76262432E12, 0.0], [1.7626245E12, 0.0], [1.7626242E12, 0.0], [1.76262468E12, 0.0], [1.76262438E12, 0.0], [1.76262408E12, 0.0], [1.76262456E12, 0.0], [1.76262426E12, 0.0], [1.76262444E12, 0.0], [1.76262414E12, 0.0], [1.76262462E12, 0.0]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.76262432E12, 0.0], [1.7626245E12, 0.0], [1.7626242E12, 0.0], [1.76262468E12, 0.0], [1.76262438E12, 0.0], [1.76262408E12, 0.0], [1.76262456E12, 0.0], [1.76262426E12, 0.0], [1.76262444E12, 0.0], [1.76262414E12, 0.0], [1.76262462E12, 0.0]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76262468E12, "title": "Bytes Throughput Over Time"}},
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
        data: {"result": {"minY": 209.55843743383434, "minX": 1.76262408E12, "maxY": 222.21518987341776, "series": [{"data": [[1.76262432E12, 212.52315593730629], [1.7626245E12, 212.4902585901531], [1.7626242E12, 215.55335968379444], [1.76262468E12, 209.55843743383434], [1.76262438E12, 214.5897871579325], [1.76262408E12, 222.21518987341776], [1.76262456E12, 214.96041200179135], [1.76262426E12, 213.68421521468034], [1.76262444E12, 217.42150557115667], [1.76262414E12, 211.9604704633898], [1.76262462E12, 210.55674536996358]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76262468E12, "title": "Response Time Over Time"}},
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
        data: {"result": {"minY": 0.0, "minX": 1.76262408E12, "maxY": 4.9E-324, "series": [{"data": [[1.76262432E12, 0.0], [1.7626245E12, 0.0], [1.7626242E12, 0.0], [1.76262468E12, 0.0], [1.76262438E12, 0.0], [1.76262408E12, 0.0], [1.76262456E12, 0.0], [1.76262426E12, 0.0], [1.76262444E12, 0.0], [1.76262414E12, 0.0], [1.76262462E12, 0.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76262468E12, "title": "Latencies Over Time"}},
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
        data: {"result": {"minY": 0.0, "minX": 1.76262408E12, "maxY": 4.9E-324, "series": [{"data": [[1.76262432E12, 0.0], [1.7626245E12, 0.0], [1.7626242E12, 0.0], [1.76262468E12, 0.0], [1.76262438E12, 0.0], [1.76262408E12, 0.0], [1.76262456E12, 0.0], [1.76262426E12, 0.0], [1.76262444E12, 0.0], [1.76262414E12, 0.0], [1.76262462E12, 0.0]], "isOverall": false, "label": "JSR223 Sampler", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76262468E12, "title": "Connect Time Over Time"}},
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
        data: {"result": {"minY": 161.0, "minX": 1.76262408E12, "maxY": 681.0, "series": [{"data": [[1.76262432E12, 351.0], [1.7626245E12, 345.0], [1.7626242E12, 371.0], [1.76262468E12, 335.0], [1.76262438E12, 333.0], [1.76262408E12, 681.0], [1.76262456E12, 348.0], [1.76262426E12, 337.0], [1.76262444E12, 364.0], [1.76262414E12, 344.0], [1.76262462E12, 362.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.76262432E12, 164.0], [1.7626245E12, 162.0], [1.7626242E12, 165.0], [1.76262468E12, 164.0], [1.76262438E12, 164.0], [1.76262408E12, 166.0], [1.76262456E12, 164.0], [1.76262426E12, 161.0], [1.76262444E12, 163.0], [1.76262414E12, 161.0], [1.76262462E12, 164.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.76262432E12, 262.0], [1.7626245E12, 262.0], [1.7626242E12, 264.0], [1.76262468E12, 262.0], [1.76262438E12, 264.0], [1.76262408E12, 265.0], [1.76262456E12, 263.0], [1.76262426E12, 263.0], [1.76262444E12, 266.0], [1.76262414E12, 263.0], [1.76262462E12, 262.0]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.76262432E12, 314.0], [1.7626245E12, 308.0], [1.7626242E12, 325.0], [1.76262468E12, 306.0], [1.76262438E12, 313.0], [1.76262408E12, 331.0], [1.76262456E12, 320.0], [1.76262426E12, 325.0], [1.76262444E12, 331.0], [1.76262414E12, 302.0], [1.76262462E12, 297.0599999999995]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.76262432E12, 199.0], [1.7626245E12, 199.0], [1.7626242E12, 202.0], [1.76262468E12, 189.0], [1.76262438E12, 207.0], [1.76262408E12, 223.0], [1.76262456E12, 204.0], [1.76262426E12, 200.0], [1.76262444E12, 207.0], [1.76262414E12, 197.0], [1.76262462E12, 194.0]], "isOverall": false, "label": "Median", "isController": false}, {"data": [[1.76262432E12, 268.0], [1.7626245E12, 267.0], [1.7626242E12, 270.0], [1.76262468E12, 267.0], [1.76262438E12, 270.0], [1.76262408E12, 272.0], [1.76262456E12, 268.0], [1.76262426E12, 271.0], [1.76262444E12, 275.0], [1.76262414E12, 267.0], [1.76262462E12, 267.0]], "isOverall": false, "label": "95th percentile", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76262468E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
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
    data: {"result": {"minY": 176.0, "minX": 2.0, "maxY": 419.5, "series": [{"data": [[2.0, 419.5], [88.0, 224.0], [156.0, 250.0], [153.0, 245.0], [158.0, 246.5], [155.0, 253.0], [159.0, 247.0], [167.0, 239.0], [161.0, 244.0], [162.0, 245.0], [163.0, 218.0], [164.0, 240.0], [166.0, 237.0], [160.0, 255.0], [165.0, 238.0], [169.0, 236.0], [171.0, 238.0], [170.0, 231.0], [168.0, 244.0], [175.0, 232.0], [172.0, 240.0], [173.0, 230.0], [174.0, 221.5], [182.0, 203.0], [179.0, 213.0], [177.0, 221.0], [180.0, 209.5], [183.0, 219.0], [181.0, 216.0], [176.0, 226.0], [178.0, 212.0], [190.0, 200.0], [191.0, 196.0], [187.0, 198.0], [186.0, 212.0], [184.0, 215.0], [189.0, 202.0], [188.0, 196.5], [185.0, 201.0], [197.0, 188.0], [199.0, 194.0], [198.0, 183.0], [196.0, 194.0], [192.0, 195.0], [193.0, 194.0], [195.0, 188.0], [194.0, 198.0], [204.0, 184.0], [207.0, 194.0], [206.0, 183.0], [200.0, 186.0], [205.0, 185.0], [201.0, 185.0], [203.0, 190.0], [202.0, 184.0], [208.0, 182.0], [211.0, 184.0], [215.0, 182.0], [209.0, 179.0], [210.0, 186.0], [214.0, 178.0], [213.0, 179.0], [216.0, 178.0], [217.0, 181.0], [218.0, 180.0], [223.0, 176.0], [221.0, 178.0], [222.0, 176.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 223.0, "title": "Response Time Vs Request"}},
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
    data: {"result": {"minY": 0.0, "minX": 2.0, "maxY": 4.9E-324, "series": [{"data": [[2.0, 0.0], [88.0, 0.0], [156.0, 0.0], [153.0, 0.0], [158.0, 0.0], [155.0, 0.0], [159.0, 0.0], [167.0, 0.0], [161.0, 0.0], [162.0, 0.0], [163.0, 0.0], [164.0, 0.0], [166.0, 0.0], [160.0, 0.0], [165.0, 0.0], [169.0, 0.0], [171.0, 0.0], [170.0, 0.0], [168.0, 0.0], [175.0, 0.0], [172.0, 0.0], [173.0, 0.0], [174.0, 0.0], [182.0, 0.0], [179.0, 0.0], [177.0, 0.0], [180.0, 0.0], [183.0, 0.0], [181.0, 0.0], [176.0, 0.0], [178.0, 0.0], [190.0, 0.0], [191.0, 0.0], [187.0, 0.0], [186.0, 0.0], [184.0, 0.0], [189.0, 0.0], [188.0, 0.0], [185.0, 0.0], [197.0, 0.0], [199.0, 0.0], [198.0, 0.0], [196.0, 0.0], [192.0, 0.0], [193.0, 0.0], [195.0, 0.0], [194.0, 0.0], [204.0, 0.0], [207.0, 0.0], [206.0, 0.0], [200.0, 0.0], [205.0, 0.0], [201.0, 0.0], [203.0, 0.0], [202.0, 0.0], [208.0, 0.0], [211.0, 0.0], [215.0, 0.0], [209.0, 0.0], [210.0, 0.0], [214.0, 0.0], [213.0, 0.0], [216.0, 0.0], [217.0, 0.0], [218.0, 0.0], [223.0, 0.0], [221.0, 0.0], [222.0, 0.0]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 223.0, "title": "Latencies Vs Request"}},
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
        data: {"result": {"minY": 30.95, "minX": 1.76262408E12, "maxY": 189.88333333333333, "series": [{"data": [[1.76262432E12, 188.21666666666667], [1.7626245E12, 188.2], [1.7626242E12, 185.53333333333333], [1.76262468E12, 156.76666666666668], [1.76262438E12, 186.36666666666667], [1.76262408E12, 30.95], [1.76262456E12, 186.08333333333334], [1.76262426E12, 187.1], [1.76262444E12, 183.98333333333332], [1.76262414E12, 188.46666666666667], [1.76262462E12, 189.88333333333333]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76262468E12, "title": "Hits Per Second"}},
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
        data: {"result": {"minY": 30.283333333333335, "minX": 1.76262408E12, "maxY": 189.88333333333333, "series": [{"data": [[1.76262432E12, 188.21666666666667], [1.7626245E12, 188.2], [1.7626242E12, 185.53333333333333], [1.76262468E12, 157.43333333333334], [1.76262438E12, 186.36666666666667], [1.76262408E12, 30.283333333333335], [1.76262456E12, 186.08333333333334], [1.76262426E12, 187.1], [1.76262444E12, 183.98333333333332], [1.76262414E12, 188.46666666666667], [1.76262462E12, 189.88333333333333]], "isOverall": false, "label": "200", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.76262468E12, "title": "Codes Per Second"}},
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
        data: {"result": {"minY": 30.283333333333335, "minX": 1.76262408E12, "maxY": 189.88333333333333, "series": [{"data": [[1.76262432E12, 188.21666666666667], [1.7626245E12, 188.2], [1.7626242E12, 185.53333333333333], [1.76262468E12, 157.43333333333334], [1.76262438E12, 186.36666666666667], [1.76262408E12, 30.283333333333335], [1.76262456E12, 186.08333333333334], [1.76262426E12, 187.1], [1.76262444E12, 183.98333333333332], [1.76262414E12, 188.46666666666667], [1.76262462E12, 189.88333333333333]], "isOverall": false, "label": "JSR223 Sampler-success", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76262468E12, "title": "Transactions Per Second"}},
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
        data: {"result": {"minY": 30.283333333333335, "minX": 1.76262408E12, "maxY": 189.88333333333333, "series": [{"data": [[1.76262432E12, 188.21666666666667], [1.7626245E12, 188.2], [1.7626242E12, 185.53333333333333], [1.76262468E12, 157.43333333333334], [1.76262438E12, 186.36666666666667], [1.76262408E12, 30.283333333333335], [1.76262456E12, 186.08333333333334], [1.76262426E12, 187.1], [1.76262444E12, 183.98333333333332], [1.76262414E12, 188.46666666666667], [1.76262462E12, 189.88333333333333]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.76262468E12, "title": "Total Transactions Per Second"}},
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

