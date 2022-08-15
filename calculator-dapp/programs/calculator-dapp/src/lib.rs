use anchor_lang::prelude::*;
// use anchor_lang::solana_program::entrypoint::ProgramResult;
// use anchor_lang::AccountsExit;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod calculator_dapp {
    use super::*;

    pub fn create(_ctx: Context<Create>, _init_message: String) -> Result<()> {
        let calculator: & mut Account<Calculator> = &mut _ctx.accounts.calculator;
        calculator.greeting = _init_message;
        Ok(())
    }

    pub fn add(_ctx: Context<Addition>, _num1: i64, _num2: i64) -> Result<()> {
        let calculator: & mut Account<Calculator> = &mut _ctx.accounts.calculator;
        calculator.result = _num1 + _num2;
        Ok(())
    }

    pub fn subtract(_ctx: Context<Subtraction>, _num1: i64, _num2: i64) -> Result<()> {
        let calculator: & mut Account<Calculator> = &mut _ctx.accounts.calculator;
        calculator.result = _num1  - _num2;
        Ok(())
    }

    pub fn multiply(_ctx: Context<Multiplicaton>, _num1: i64, _num2: i64) -> Result<()> {
        let calculator: & mut Account<Calculator> = &mut _ctx.accounts.calculator;
        calculator.result = _num1  * _num2;
        Ok(())
    }

    pub fn divide(_ctx: Context<Division>, _num1: i64, _num2: i64) -> Result<()> {
        let calculator: & mut Account<Calculator> = &mut _ctx.accounts.calculator;
        calculator.result = _num1  / _num2;
        calculator.remainder = _num1 % _num2;
        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct Calculator {
    pub greeting: String,
    // for returning calculation result
    pub result: i64,
    pub remainder: i64
}

// retrieve the list of accounts' data
// derive macro, need to added when using the account
#[derive(Accounts)]
pub struct Create<'info> {
    // init: init calculator account
    // payer: who pay the cost for creating account
    // space: the amount of space allocated for the account
    #[account(init, payer=user, space=264)]
    pub calculator: Account<'info, Calculator>,
    pub system_program: Program<'info, System>,

    // required for using 'account'
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct Addition<'info> {
    // required for using 'account'
    #[account(mut)]
    pub calculator: Account<'info, Calculator>,
}

#[derive(Accounts)]
pub struct Subtraction<'info> {
    // required for using 'account'
    #[account(mut)]
    pub calculator: Account<'info, Calculator>,
}

#[derive(Accounts)]
pub struct Multiplicaton<'info> {
    // required for using 'account'
    #[account(mut)]
    pub calculator: Account<'info, Calculator>,
}

#[derive(Accounts)]
pub struct Division<'info> {
    // required for using 'account'
    #[account(mut)]
    pub calculator: Account<'info, Calculator>,
}