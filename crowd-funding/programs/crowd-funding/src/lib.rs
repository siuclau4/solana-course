use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::program::invoke;


declare_id!("98iDNvmZNL18JGNS3BPXZgtkBFCxmQM8QYSQff6q7xzN");
// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod crowd_funding {
    use super::*;

    pub fn create(_ctx: Context<Create>, _name:String, description:String) -> ProgramResult {
        let campaign = &mut _ctx.accounts.campaign;
        campaign.name = _name;
        campaign.description = description;
        campaign.account_donated = 0;
        campaign.admin = *_ctx.accounts.user.key; // dereference _ctx
        Ok(())
    }

    pub fn withdraw(_ctx: Context<Withdraw>, _amount: u64) -> ProgramResult {
        let campaign = &mut _ctx.accounts.campaign;
        let user = &mut _ctx.accounts.user;
        if *user.key != campaign.admin {
            return Err(ProgramError::IncorrectProgramId);
        }
        // need to put some amount in the account for rent
        // alternatively, put 2 years rent in account, no rent will be collected - Rent Exemption
        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());

        // campaign.to_account_info().lamports.borrow(): Ref<'_, &mut u64>
        // *campaign.to_account_info().lamports.borrow(): &mut u64
        if **campaign.to_account_info().lamports.borrow() - rent_balance < _amount {
            return Err(ProgramError::InsufficientFunds);
        }
        **campaign.to_account_info().try_borrow_mut_lamports()? -= _amount;
        **user.to_account_info().try_borrow_mut_lamports()? += _amount;
        Ok(())
    }

    pub fn donate(_ctx: Context<Donate>, _amount: u64) -> ProgramResult {
        /* 
        in this case, program has no right to transfer user's token
        we need to use 'instruction' to ask user to transfer
        */

        let ix = transfer(
            &_ctx.accounts.user.key(),
            &_ctx.accounts.campaign.key(),
            _amount
        );

        invoke(
            &ix,
            &[
                _ctx.accounts.user.to_account_info(),
                _ctx.accounts.campaign.to_account_info()
            ]
        )?;

        let campaign = &mut _ctx.accounts.campaign;
        campaign.account_donated += _amount;
        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct Campaign {
    pub name: String,
    pub description: String,
    pub account_donated: u64,
    pub admin: Pubkey
}

#[derive(Accounts)]
pub struct Create<'info> {
    // init: init calculator account
    // payer: who pay the cost for creating account
    // space: the amount of space allocated for the account
    // seeds, required for storing data
    #[account(init, payer=user, 
        space=9000,
    seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()], // solana will use hash function to determine the address of the account
    bump // add 8-bit bump to the hash function
    )]
    pub campaign: Account<'info, Campaign>,
    pub system_program: Program<'info, System>,

    // required for using 'account', set user become mutable
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

