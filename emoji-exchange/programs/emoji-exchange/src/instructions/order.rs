use anchor_lang::{
    prelude::*,
    system_program,
};

use crate::store::StoreEmoji;
use crate::user::{ UserEmoji, UserMetadata };
use crate::vault::Vault;


/*
* Facilitates a buy or sell of an emoji.
*/
pub fn place_order(
    ctx: Context<PlaceOrder>,
    _user_metadata_bump: u8,
    _user_emoji_bump: u8,
    _store_emoji_bump: u8,
    _vault_bump: u8,
    emoji_seed: String,
    order_type: OrderType, 
    quantity: u8,
) -> Result<()> {

    let user_metadata = &mut ctx.accounts.user_metadata;
    let user_emoji = &mut ctx.accounts.user_emoji;
    let store_emoji = &mut ctx.accounts.store_emoji;
    match order_type {
        OrderType::Buy => {
            msg!("New order:    BUY : {} : {}", quantity, emoji_seed);
            msg!("  Requester: {}", ctx.accounts.user_wallet.key());
            if quantity > store_emoji.balance {
                msg!("Emoji: {}", &store_emoji.emoji_name);
                msg!("Store balance: {}", store_emoji.balance);
                return Err(error!(OrderError::InsufficientStoreBalance))
            };
            system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    system_program::Transfer {
                        from: ctx.accounts.user_wallet.to_account_info(),
                        to: ctx.accounts.vault.to_account_info(),
                    }
                ),
                store_emoji.price * quantity as u64
            )?;
            let new_user_balance = user_emoji.balance + quantity;
            user_emoji.cost_average = ((user_emoji.cost_average * user_emoji.balance as u64) + (store_emoji.price * quantity as u64)) / new_user_balance as u64;
            store_emoji.balance -= quantity;
            user_emoji.balance = new_user_balance;
            user_metadata.trade_count += 1;
        },
        OrderType::Sell => {
            msg!("New order:    SELL : {} : {}", quantity, emoji_seed);
            msg!("  Requester: {}", ctx.accounts.user_wallet.key());
            if quantity > user_emoji.balance {
                msg!("Emoji: {}", &user_emoji.emoji_name);
                msg!("User balance: {}", user_emoji.balance);
                return Err(error!(OrderError::InsufficientUserBalance))
            };
            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= store_emoji.price * quantity as u64;
            **ctx.accounts.user_wallet.to_account_info().try_borrow_mut_lamports()? += store_emoji.price * quantity as u64;
            store_emoji.balance += quantity;
            user_emoji.balance -= quantity;
            user_metadata.trade_count += 1;
        }
    };
    msg!("Order processed successfully.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    user_metadata_bump: u8,
    user_emoji_bump: u8,
    store_emoji_bump: u8,
    vault_bump: u8,
    emoji_seed: String,
    order_type: OrderType, 
    quantity: u8,
)]
pub struct PlaceOrder<'info> {
    #[account(
        mut, 
        seeds = [
            user_wallet.key.as_ref(),
            b"_user_metadata"
        ],
        bump = user_metadata_bump
    )]
    pub user_metadata: Account<'info, UserMetadata>,
    #[account(
        mut, 
        seeds = [
            user_wallet.key.as_ref(),
            b"_user_", 
            emoji_seed.as_bytes()
        ],
        bump = user_emoji_bump
    )]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(
        mut, 
        seeds = [
            b"store_", 
            emoji_seed.as_bytes()
        ],
        bump = store_emoji_bump
    )]
    pub store_emoji: Account<'info, StoreEmoji>,
    #[account(
        mut, 
        seeds = [ b"vault" ],
        bump = vault_bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub user_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub enum OrderType {
    Buy,
    Sell,
}

#[error_code]
pub enum OrderError {
    #[msg("Insufficient store balance.")]
    InsufficientStoreBalance,
    #[msg("Insufficient user balance.")]
    InsufficientUserBalance,
}