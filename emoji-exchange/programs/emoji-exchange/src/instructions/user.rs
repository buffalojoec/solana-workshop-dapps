use anchor_lang::prelude::*;

use crate::store::StoreEmoji;


/*
* Creates metadata PDA for a user.
*/
pub fn create_user_metadata(
    ctx: Context<CreateUserMetadata>,
    username: String,
) -> Result<()> {

    msg!("Request to create User Metadata PDA for wallet: {}", &ctx.accounts.user_wallet.key);
    let user_metadata = &mut ctx.accounts.user_metadata;
    user_metadata.username = username;
    msg!("Success.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    username: String,
)]
pub struct CreateUserMetadata<'info> {
    #[account(
        init, 
        payer = user_wallet, 
        space = 8 + 48,
        seeds = [
            user_wallet.key.as_ref(),
            b"_user_metadata"
        ],
        bump
    )]
    pub user_metadata: Account<'info, UserMetadata>,
    #[account(mut)]
    pub user_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserMetadata {
    pub username: String,
}


/*
* Creates an emoji PDA for a user.
*/
pub fn create_user_emoji(
    ctx: Context<CreateUserEmoji>,
    _store_emoji_bump: u8,
    emoji_seed: String,
) -> Result<()> {

    msg!("Request to create User Emoji PDA for emoji: {}", emoji_seed);
    let store_emoji = &ctx.accounts.store_emoji;
    let user_emoji = &mut ctx.accounts.user_emoji;
    user_emoji.emoji_name = store_emoji.emoji_name.clone();
    user_emoji.display = store_emoji.display.clone();
    user_emoji.balance = 0;
    user_emoji.cost_average = 0;
    msg!("Success.");
    Ok(())
}

#[derive(Accounts)]
#[instruction(
    store_emoji_bump: u8,
    emoji_seed: String,
)]
pub struct CreateUserEmoji<'info> {
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
        init, 
        payer = user_wallet, 
        space = 8 + 40 + 8,
        seeds = [
            user_wallet.key.as_ref(),
            b"_user_", 
            emoji_seed.as_bytes()
        ],
        bump
    )]
    pub user_emoji: Account<'info, UserEmoji>,
    #[account(mut)]
    pub user_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserEmoji {
    pub emoji_name: String,
    pub display: String,
    pub balance: u8,
    pub cost_average: u64,
}