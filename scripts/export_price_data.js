mongoexport --host localhost --port 3001 -d meteor -c historicalPriceData -f medican_price,median_net_price,average_price,average_net_price,lowest_price,lowest_net_price,highest_price,highest_net_price,volume,startTime,endTime,name,first_seen --type=csv -o data.csv -q '{success: true}'