#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_help {
    echo "Usage: $0 {up|down|restart}"
    echo "  up       - Start the network"
    echo "  down     - Stop the network"
    echo "  restart  - Restart the network"
}

function network_up {
    echo -e "${GREEN}Starting FarmTrace Blockchain Network...${NC}"
    
    # Generate crypto materials
    echo -e "${YELLOW}Generating crypto materials...${NC}"
    cd ../
    cryptogen generate --config=crypto-config.yaml
    
    # Create channel artifacts directory
    mkdir -p channel-artifacts
    
    # Generate genesis block
    echo -e "${YELLOW}Generating genesis block...${NC}"
    configtxgen -profile TwoOrgsOrdererGenesis -channelID farmtrace-sys-channel -outputBlock ./channel-artifacts/genesis.block
    
    # Generate channel transaction
    echo -e "${YELLOW}Generating channel transaction...${NC}"
    configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID farmtracechannel
    
    # Start Docker containers
    echo -e "${YELLOW}Starting Docker containers...${NC}"
    docker-compose up -d
    
    # Wait for containers to start
    sleep 10
    
    echo -e "${GREEN}✅ Network started successfully!${NC}"
    echo -e "${GREEN}📊 Check running containers: docker ps${NC}"
}

function network_down {
    echo -e "${RED}Stopping FarmTrace Blockchain Network...${NC}"
    cd ../
    docker-compose down
    
    # Clean up
    docker system prune -f
    sudo rm -rf crypto-config channel-artifacts
    
    echo -e "${RED}✅ Network stopped and cleaned up!${NC}"
}

function network_restart {
    network_down
    sleep 5
    network_up
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

case $1 in
    up)
        network_up
        ;;
    down)
        network_down
        ;;
    restart)
        network_restart
        ;;
    *)
        print_help
        exit 1
        ;;
esac
