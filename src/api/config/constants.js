const constants = {
  APPLICATION_ID: '50e579b208ba4ae5b709d33abc63512e',
  BRAND_NAME: 'investech',
  ORIGINATION_IDENTITY: '+18778495137',
  REFERENCE_ID: 'investech-2fa',
  ALLOWED_ATTEMPTS: '3',
  CODE_LENGTH: '6',
  EXPIRATION_TIME: '5', // In minutes
  REMEMBER_ME_EXPIRY: '30d',
  JWT_EXPIRES_IN: '1d',
  templateIds: {
    // INVESTOR_SIGN_UP_INITIAL_EMAIL: 'd-9e8af02381d540b1a9f481c8748baddc',
    '2FA_SETUP': 'd-82291cff9be145b496fa7272898092fb', // done{method: 'SMS'/'Authenticator}
    GRANTING_EARLY_ACCESS: 'd-1f71f2ddc9644c4480b307bd7d192fb7',
    VERIFY_EMAIL: 'd-32f2dcde091040a9898ee81cb496ac54', // {otp}
    WITHDRAWAL_SUCCESS: 'd-b4503878efa94b93910fbdf32cadeba6', // {amount: 10000}
    DEPOSIT_SUCCESS: 'd-5e24570738d9494b92522beb6551761d', // {amount: 10000}
    FORGOT_PASSWORD: 'd-eddae50bdd6840938f9849c38132de4e', // {url: '',name} done
    TEMPORARY_PASSWORD: 'd-0e6e0c829bad4044b6f70e43a1a9f757', // {email: 'abc@xyz.com, temporaryPassword: 'qwert432'}
    NEW_DEVICE_SIGNED_IN: 'd-7957c8ccf5ac4dd5b56c8f96e791a466',// {supportEmail,device_name,time,location,ip_address, url,name}
    // PROPERTY_COMING_SOON: 'd-b7fdbbb694e448da878c6f0debc1fca0', // {mainImage, property_name, state, city, perTokenPrice, asset_value, gross_profit, marketplace_url, description, otherInfo.quote, otherInfo.interestRate, propertyValues.projectedInvGain}
    // PROPERTY_COMING_2_DAYS: 'd-6206ff58b7e44dfabb4d8644cbf0349f',
    // PROPERTY_LAUNCHING_TOMORROW: 'd-caf6af6b7da04cd7a2788c71df8bbd46',
    // PROPERTY_15_MINUTES_BEFORE_LIVE: 'd-53bda0528cb14950933239f9476dc9ae',
    // PROPERTY_LAUNCH_FINAL: 'd-fc8eb9b0cdb54102ad75a7120331920b',
    // PROPERTY_SOLD_90_PERCENT: 'd-e6e5432df0a24fe798ece264b15307bf',
    // PROPERTY_SOLD_OUT: 'd-8df94e767f8741d08dff116d91442957', // {mainImage, property_name, state, city, perTokenPrice, asset_value, gross_profit, marketplace_url, description, otherInfo.quote, otherInfo.interestRate, propertyValues.projectedInvGain}
    INVESTMENT_SUCCESS: 'd-d1492b48ed3947c7ac0f48a7082d78a0', // {amount: '1000', property_name: 'Property Name', url: 'portfolio url', marketplace_url: 'marketplace url',supportEmail}
    KYC_VERIFIED: 'd-0f70c575b3e149f39d6aac8f8e6f0765', // {{name,supportEmail}}
    WELCOME_TO_INVESTECH: 'd-5eb32ee3894e49a4b22565f203ef2036', // done {{name,supportEmail}}  
    TOKENS_MINTED: 'd-0b458f7896df4bf7b38d1ef886dbd3a9', // {{property_name, numberOfTokens, pricePerToken, startDate}}
    ONECLICK_TEMPORARY_PASSWORD: 'd-17347fbc1d9c4811af73ee1a60d7a7e0', // {{email, temporaryPassword, url}}
    // REWARDS: 'd-e3c67e226ce54e69bef79a78c016ce63', // {{referral: true/false, amount_received}}
    // REFEREE_ONBOARDED: 'd-98162dc13faa4f5cad875e11d1eee37a', // {{user}}
  },
  fromname: 'investech',
};

export default constants;
