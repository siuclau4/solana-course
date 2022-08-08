use anchor_lang::prelude::*;
// use anchor_lang::solana_program::entrypoint::ProgramResult;
// use anchor_lang::AccountsExit;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod calculator_dapp {
    use super::*;

    pub fn create(_ctx: Context<Create>, _init_message: String) -> Result<()> {
        let calculator = &mut _ctx.accounts.calculator;
        calculator.greeting = _init_message;
        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct Calculator {
    pub greeting: String,
    pub result: i64,
    pub remainder: i64
}

// retrieve the list of accounts' data
// derive macro
#[derive(Accounts)]
pub struct Create<'info> {
    // init: init calculator account
    // payer: who pay the cost for creating account
    // space: the amount of space allocated for the account
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init, payer=user, space=264)]
    pub calculator: Account<'info, Calculator>,
    // required for using 'account'
    pub system_program: Program<'info, System>
}


