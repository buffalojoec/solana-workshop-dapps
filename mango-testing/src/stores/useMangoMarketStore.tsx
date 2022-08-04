import create, { State } from 'zustand'
import { Connection, PublicKey } from "@solana/web3.js";
import { Market } from "@project-serum/serum";
import {
    Cluster,
    Config,
    // getSpotMarketByBaseSymbol,
    GroupConfig,
    OracleConfig,
    PerpMarketConfig,
    SpotMarketConfig,
    TokenConfig,
} from "@blockworks-foundation/mango-client";
import { groups, cluster_urls } from '../utils/ids.json';


const DEX_PID = new PublicKey(
    "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"
);

interface MangoMarketStore extends State {
  price: number;
  getMangoMarket: () => void
}

function getGroup(cluster: string, group: string): GroupConfig {
    for (var g of groups) {
        if (g.cluster === cluster && g.name === group) {
            return {
                cluster: g.cluster as Cluster,
                name: g.name,
                quoteSymbol: g.quoteSymbol,
                publicKey: new PublicKey(g.publicKey),
                mangoProgramId: new PublicKey(g.mangoProgramId),
                serumProgramId: new PublicKey(g.serumProgramId),
                oracles: g.oracles.map((o) => { 
                    return { 
                        symbol: o.symbol, 
                        publicKey: new PublicKey(o.publicKey) 
                    } as OracleConfig
                }),
                perpMarkets: g.perpMarkets.map((p) => { 
                    return { 
                        name: p.name,
                        publicKey: new PublicKey(p.publicKey),
                        baseSymbol: p.baseSymbol,
                        baseDecimals: p.baseDecimals,
                        quoteDecimals: p.quoteDecimals,
                        marketIndex: p.marketIndex,
                        bidsKey: new PublicKey(p.bidsKey),
                        asksKey: new PublicKey(p.asksKey),
                        eventsKey: new PublicKey(p.eventsKey),
                } as PerpMarketConfig
            }),
                spotMarkets: g.spotMarkets.map((s) => { 
                    return { 
                        name: s.name,
                        publicKey: new PublicKey(s.publicKey),
                        baseSymbol: s.baseSymbol,
                        baseDecimals: s.baseDecimals,
                        quoteDecimals: s.quoteDecimals,
                        marketIndex: s.marketIndex,
                        bidsKey: new PublicKey(s.bidsKey),
                        asksKey: new PublicKey(s.asksKey),
                        eventsKey: new PublicKey(s.eventsKey),
                } as SpotMarketConfig
            }),
                tokens: g.tokens.map((t) => { 
                    return { 
                        symbol: t.symbol,
                        mintKey: new PublicKey(t.mintKey),
                        decimals: t.decimals,
                        rootKey: new PublicKey(t.rootKey),
                        nodeKeys: t.nodeKeys.map((tn) => { return new PublicKey(tn) }),
                    } as TokenConfig
                }),
            };
        };
        throw("Group not found!");
    }
}

function getSpotMarketByBaseSymbol(groupConfig: GroupConfig, symbol: string): SpotMarketConfig {
    for (var spotMarket of groupConfig.spotMarkets) {
        if (spotMarket.baseSymbol === symbol) {
            return spotMarket;
        };
        throw("Symbol not found!");
    }
}

async function getMangoMarketPrice(): Promise<number> {
    const cluster = "mainnet";
    const group = "mainnet.1";
//   const config = new Config('../utils/ids.json');
    const groupConfig = getGroup(cluster, group);
    if (!groupConfig) {
    throw new Error("unable to get mango group config");
    }
    const clusterUrl = cluster_urls[cluster];
    const connection = new Connection(clusterUrl, 'singleGossip');
//   const marketConfig = getSpotMarketByBaseSymbol(groupConfig, "SOL");
    const marketConfig = getSpotMarketByBaseSymbol(groupConfig, "SOL");
//   const market = await Market.load(
//       connection,
//       marketConfig.publicKey,
//       {
        
//       },
//       groupConfig.serumProgramId
//   );
    const market = Market.load(connection, marketConfig.publicKey, {}, groupConfig.serumProgramId);
//   const bids = await market.loadBids(connection);
//   return bids.getL2(1)[0][0];
  return 1;
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
      console.log(`price updated: `, price);
    })
  },
}));

export default useMangoMarketStore;