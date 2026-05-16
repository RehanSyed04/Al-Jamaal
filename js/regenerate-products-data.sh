#!/bin/bash
RESULT=$(curl -s --max-time 30 "https://aljamaal-shipping.syedsarmiento.workers.dev/get-products")
if [ -n "$RESULT" ] && [ "$RESULT" != "null" ]; then
  echo "window.productsData = $RESULT;" > /var/www/html/js/products-data.js
fi
