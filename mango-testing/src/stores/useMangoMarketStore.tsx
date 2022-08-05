import create, { State } from 'zustand'
import { Connection } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import {
  IDS,
  Config,
  getSpotMarketByBaseSymbol,
} from "@blockworks-foundation/mango-client";

interface MangoMarketStore extends State {
  price: number;
  getMangoMarket: () => void
}

async function getMangoMarketPrice(): Promise<number> {
  const cluster = "mainnet";
  const group = "mainnet.1";
  const config = new Config(IDS);
  const groupConfig = config.getGroup(cluster, group);
  if (!groupConfig) {
  throw new Error("unable to get mango group config");
  }
  const clusterUrl = IDS.cluster_urls[cluster];
  const connection = new Connection(clusterUrl, 'singleGossip');
  const marketConfig = getSpotMarketByBaseSymbol(groupConfig, "SOL");
  const market = await Market.load(
      connection,
      marketConfig.publicKey,
      {},
      groupConfig.serumProgramId
  );
  const bids = await market.loadBids(connection);
  return bids.getL2(1)[0][0];
}

const useMangoMarketStore = create<MangoMarketStore>((set, _get) => ({
  price: 0,
  getMangoMarket: async () => {
    let price = 0;
    try {
      price = await getMangoMarketPrice();
    } catch (e) {
      console.log(`error getting price: `, e);
    }
    set((s) => {
      s.price = price;
      console.log(`price updated, `, price);
    })
  },
}));

export default useMangoMarketStore;