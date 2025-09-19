#!/bin/bash
# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color
echo -e "${BLUE}📱 FarmTrace Mobile Connection Test Script${NC}"
echo -e "${BLUE}=========================================${NC}"
# Function to get local IP
get_local_ip() {
# Try different methods to get local IP
local ip=""
# Method 1: hostname -I (Linux)
if command -v hostname &> /dev/null; then
ip=$(hostname -I | awk '{print $1}' 2>/dev/null)
fi
# Method 2: ip route (Linux)
if [[ -z "$ip" ]] && command -v ip &> /dev/null; then
ip=$(ip route get 1.1.1.1 | grep -oP 'src \\K\\S+' 2>/dev/null)
fi# Method 3: ifconfig (fallback)
if [[ -z "$ip" ]] && command -v ifconfig &> /dev/null; then
ip=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\\.){3}[0-9]*' | grep -Eo '([0-9]*\
fi
# Default fallback
if [[ -z "$ip" ]]; then
ip="localhost"
fi
echo "$ip"
}
# Get server details
PORT=${PORT:-3001}
LOCAL_IP=$(get_local_ip)
echo -e "${YELLOW}🔍 Detected Configuration:${NC}"
echo -e "
Local IP: ${LOCAL_IP}"
echo -e "
Port: ${PORT}"
echo -e "
Server URL: http://${LOCAL_IP}:${PORT}"
echo ""
# Test if server is running
echo -e "${YELLOW}🔧 Testing server connectivity...${NC}"
# Test localhost first
if curl -s "http://localhost:${PORT}/health" > /dev/null; then
echo -e "${GREEN}✅ Server running on localhost${NC}"
else
echo -e "${RED}❌ Server not running on localhost:${PORT}${NC}"
echo -e "${YELLOW}💡 Make sure to start the backend server first:${NC}"
echo -e "
cd backend && npm run dev"
exit 1
fi
# Test local IP
if [[ "$LOCAL_IP" != "localhost" ]]; then
if curl -s "http://${LOCAL_IP}:${PORT}/health" > /dev/null; then
echo -e "${GREEN}✅ Server accessible via local IP${NC}"
else
echo -e "${RED}❌ Server not accessible via local IP${NC}"
echo -e "${YELLOW}💡 This might be a firewall issue. Try:${NC}"
echo -e "
1. Allow port ${PORT} in Windows Firewall"
echo -e "
2. Make sure server starts with HOST=0.0.0.0"
exit 1
fi
fi
echo ""
echo -e "${GREEN}🎉 Server connectivity test passed!${NC}"
echo ""
# Generate test QR code
echo -e "${YELLOW}📱 Mobile Testing Instructions:${NC}"echo -e "${BLUE}===============================${NC}"
echo ""
echo -e "1. ${YELLOW}Connect your mobile device to the same WiFi network${NC}"
echo ""
echo -e "2. ${YELLOW}Test mobile browser connection:${NC}"
echo -e "
Open browser on mobile and visit:"
echo -e "
${GREEN}http://${LOCAL_IP}:${PORT}/health${NC}"
echo ""
echo -e "3. ${YELLOW}You should see a JSON response like:${NC}"
echo -e '
{"status":"OK","message":"FarmTrace API is running",...}'
echo ""
echo -e "4. ${YELLOW}Create a product and scan the QR code:${NC}"
echo -e "
The QR code will now use: ${GREEN}http://${LOCAL_IP}:${PORT}/verify/PRODUCT_I
echo ""
echo -e "5. ${YELLOW}If mobile browser test fails:${NC}"
echo -e "
- Check WiFi connection (same network)"
echo -e "
- Check Windows Firewall settings"
echo -e "
- Try disabling Windows Firewall temporarily"
echo ""
# Create a test QR code URL
echo -e "${YELLOW}🔗 Test QR Code Generation:${NC}"
cat << EOF
curl -X POST http://localhost:${PORT}/api/farmer/products \\
-H "Content-Type: application/json" \\
-d '{
"name": "Mobile Test Tomatoes",
"farmer": "Test Farm",
"origin": "Test Location",
"harvestDate": "2025-09-19",
"quantity": "10kg",
"price": "\\$15",
"qualityCertification": "Organic Test"
}'
EOF
echo ""
echo -e "${BLUE}📋 Troubleshooting Checklist:${NC}"
echo -e "□ Backend server running (npm run dev)"
echo -e "□ Mobile on same WiFi network"
echo -e "□ Mobile browser can access http://${LOCAL_IP}:${PORT}/health"
echo -e "□ Windows Firewall allows port ${PORT}"
echo -e "□ QR code contains correct IP address (not localhost)"
echo ""
echo -e "${GREEN}Happy mobile testing! 📱✅${NC}"
