import { FC, useEffect } from "react";
import useMangoMarketStore from "stores/useMangoMarketStore";



export const TestComponent: FC = () => {

    const { price, getMangoMarket } = useMangoMarketStore();

    useEffect(() => {
        getMangoMarket();
    }, []);

    return(
        <div>
            <p>SOL Price:</p>
            <p>{price}</p>
        </div>
    )
};