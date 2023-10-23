import { gql } from 'mercurius-codegen';

const schema = gql`
  directive @auth on OBJECT | FIELD_DEFINITION
  
  enum Lang {
    es
    en
  }

  type Country {
    id: String!
    code: String!
    name: String!
  }

  type Currency {
    id: String!
    code: String!
  }

  type Bank {
    id: String!
    name: String!
    icon: String
    bankAccounts: [BankAccount]!
  }

  type BankAccount {
    id: String!
    balance: Float!
    bank: Bank!
    accountNumber: String!
    label: String
    currency: Currency!
  }
  
  enum CreditCardIssuer {
    visa
    mastercard
    other
  }
  
  enum CreditCardStatus {
    ACTIVE
    EXPIRED
    BLOCKED
  }
  
  type CreditCard {
    id: String!
    label: String
    cardHolder: String!
    lastFourDigits: String!
    expiration: String!
    issuer: CreditCardIssuer!
    status: CreditCardStatus!
    creditLimitAmount: Float!
    creditLimitCurrency: Currency!
  }
  
  enum CategoryType {
    NEED
    WANT
    SAVE
  }
  
  type Category {
    id: String!
    name: String!
    type: CategoryType!
    isFixedPayment: Boolean!
    expenses(fromDate: String, toDate: String): [Expense]!
  }
  
  type Expense {
    id: String!
    amount: Float!
    billableDate: String!
    description: String
    currency: Currency!
    category: Category!
  }
  
  type UserCurrency {
    id: String!
    code: String!
    expenses(fromDate: String, toDate: String): [Expense]!
  }

  type User {
    id: String!
    name: String!
    email: String!
    avatar: String!
    lang: Lang
    country: Country
    currencies: [UserCurrency]!
    banks: [Bank]!
    creditCards: [CreditCard]!
    categories: [Category]!
    expenses(fromDate: String, toDate: String): [Expense]!
  }

  type Query {
    me: User
    currencies: [Currency!]!
    countries: [Country!]!
  }

  type Mutation {
    updateProfile(name: String!, lang: Lang!, countryName: String!): User
    setUserCurrencies(currencyIds: [String!]!): [Currency!]!
    
    createBank(input: NewBankInput!): Bank!
    updateBank(id: String!, input: EditBankInput!): Bank!
    deleteBank(id: String!): Boolean!
    
    createBankAccount(input: NewBankAccountInput!): BankAccount!
    updateBankAccount(id: String!, input: EditBankAccountInput!): BankAccount!
    deleteBankAccount(id: String!): Boolean!
    
    createCreditCard(input: CreditCardInput!): CreditCard!
    updateCreditCard(id: String!, input: CreditCardInput!): CreditCard!
    deleteCreditCard(id: String!): Boolean!
    
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: String!, input: CategoryInput!): Category!
    deleteCategory(id: String!): Boolean!
    
    createExpense(input: ExpenseInput!): Expense!
    deleteExpense(id: String!): Boolean!
  }

  input NewBankInput {
    name: String!
  }

  input EditBankInput {
    name: String!
  }

  input NewBankAccountInput {
    label: String
    accountNumber: String!
    balance: Float!
    bankId: String!
    currencyId: String!
  }

  input EditBankAccountInput {
    label: String
    accountNumber: String!
    balance: Float!
  }

  input CreditCardInput {
    label: String = ""
    lastFourDigits: String = ""
    cardHolder: String!
    expiration: String!
    issuer: CreditCardIssuer!
    status: CreditCardStatus! = ACTIVE
    creditLimitAmount: Float!
    creditLimitCurrencyId: String!
  }
  
  input CategoryInput {
    name: String!
    type: CategoryType!
    isFixedPayment: Boolean!
  }
  
  input ExpenseInput {
    amount: Float!
    billableDate: String!
    description: String
    currencyId: String!
    categoryId: String!
  }
`;
export default schema;
