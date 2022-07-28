use anchor_lang::prelude::*;

pub mod instructions;

use instructions::*;


declare_id!("AfJYPEKypDMsraozL24a79W4Xrq9wFXzrWqy5J2ijxgo");


#[program]
pub mod emoji_exchange {
    use super::*;

    pub fn create_vault(
        ctx: Context<CreateVault>,
    ) -> Result<()> {
        
        vault::create_vault(
            ctx, 
        )
    }

    pub fn fund_vault(
        ctx: Context<FundVault>,
        vault_bump: u8,
        lamports: u64,
    ) -> Result<()> {

        vault::fund_vault(
            ctx, 
            vault_bump, 
            lamports
        )
    }

    pub fn create_store_emoji(
        ctx: Context<CreateStoreEmoji>,
        emoji_seed: String,
        display: String,
        starting_balance: u8,
        starting_price: u64,
    ) -> Result<()> {
        
        store::create_store_emoji(
            ctx, 
            emoji_seed, 
            display,
            starting_balance, 
            starting_price
        )
    }

    pub fn update_store_emoji_price(
        ctx: Context<UpdateStoreEmojiPrice>,
        store_emoji_bump: u8,
        emoji_seed: String,
        new_price: u64,
    ) -> Result<()> {
        
        store::update_store_emoji_price(
            ctx, 
            store_emoji_bump, 
            emoji_seed, 
            new_price
        )
    }

    pub fn create_user_metadata(
        ctx: Context<CreateUserMetadata>,
        username: String,
    ) -> Result<()> {
        
        user::create_user_metadata(
            ctx, 
            username
        )
    }

    pub fn create_user_emoji(
        ctx: Context<CreateUserEmoji>,
        store_emoji_bump: u8,
        emoji_seed: String,
    ) -> Result<()> {
        
        user::create_user_emoji(
            ctx, 
            store_emoji_bump,
            emoji_seed
        )
    }

    pub fn place_order(
        ctx: Context<PlaceOrder>,
        store_emoji_bump: u8,
        user_emoji_bump: u8,
        vault_bump: u8,
        emoji_seed: String,
        order_type: OrderType, 
        quantity: u8,
    ) -> Result<()> {
        
        order::place_order(
            ctx,
            store_emoji_bump,
            user_emoji_bump,
            vault_bump,
            emoji_seed,
            order_type,
            quantity,
        )
    }
}

