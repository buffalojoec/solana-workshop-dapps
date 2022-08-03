import { FC } from "react";
import useMangoMarketStore from "stores/useMangoMarketStore";



export const TestComponent: FC = () => {

    const { price, getMangoMarket } = useMangoMarketStore();

    return(
        <div>
            <p>SOL Price:</p>
            <p>{price}</p>
        </div>
    )
};