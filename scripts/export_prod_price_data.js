mongoexport --host candidate.21.mongolayer.com:11054 --db ironFoilProd -u ironFoilProd -p N3Xg7sUgS  -c priceList -f name,timestamp,first_seen,volume,median_price,median_net_price,average_price,average_net_price,lowest_price,lowest_net_price,highest_price,highest_net_price,mean_absolute_deviation,deviation_percentage --type=csv -o data.csv