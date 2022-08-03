import { Connection, PublicKey } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import {
  IDS,
  Config,
  getSpotMarketByBaseSymbol,
  MangoCache,
  MangoClient,
} from "@blockworks-foundation/mango-client";

(async () => {
    const cluster = "mainnet";
    const group = "mainnet.1";

    const config = new Config(IDS);
    const groupConfig = config.getGroup(cluster, group);
    if (!groupConfig) {
    throw new Error("unable to get mango group config");
    }

    const clusterUrl = IDS.cluster_urls[cluster];
    const clusterData = IDS.groups.find((g) => {
        return g.name == group && g.cluster == cluster;
    });
    const mangoProgramIdPk = new PublicKey(clusterData.mangoProgramId);

    const connection = new Connection(clusterUrl, 'singleGossip');
    const client = new MangoClient(connection, mangoProgramIdPk);
    const mangoGroup = await client.getMangoGroup(groupConfig.publicKey);
    const marketConfig = getSpotMarketByBaseSymbol(groupConfig, "SOL");
    const market = await Market.load(
        connection,
        marketConfig.publicKey,
        {},
        groupConfig.serumProgramId
    );
    // Fetch orderbooks
    const bids = await market.loadBids(connection);
    const asks = await market.loadAsks(connection);

    // L2 orderbook data
    for (const [price, size] of bids.getL2(20)) {
        console.log(price, size);
    }

    // L3 orderbook data
    for (const order of asks) {
        console.log(
            order.orderId.toString('hex'),
            order.price,
            order.size,
            order.side, // 'buy' or 'sell'
        );
    }
    // let price = mangoGroup.getPrice(mangoGroup.getTokenIndex(), new MangoCache(groupConfig.publicKey, null));
    // console.log("SOL Price:")
    // console.log(price.toNumber());
})();
