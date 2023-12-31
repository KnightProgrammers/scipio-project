const schema = `
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
    savings(statuses: [SavingStatus]): [Saving!]
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
    label: String!
    cardHolder: String
    lastFourDigits: String
    expiration: String!
    issuer: CreditCardIssuer!
    status: CreditCardStatus!
    creditLimitAmount: Float!
    creditLimitCurrency: Currency!
    expenses(fromDate: String, toDate: String): [Expense]!
    monthlyStatements: [CreditCardMonthlyStatement]!
    expensesNextStatement: [Expense]!
  }

  type CreditCardMonthlyStatement {
    id: String!
    closeDate: String!
    creditCard: CreditCard!
    expenses: [Expense]!
    payment: CreditCardStatementPayment
  }
  
  enum CreditCardStatementPaymentType {
    TOTAL
    PARTIAL
    MINIMUM
  }
  
  type CreditCardStatementPaymentItemCurrency {
    currency: UserCurrency!
    type: CreditCardStatementPaymentType!
    amount: Float!
  }

  type CreditCardStatementPayment {
    id: String!
    paymentDate: String!
    monthlyStatement: CreditCardMonthlyStatement!
    currencies: [CreditCardStatementPaymentItemCurrency]!
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
    budget: BudgetItem
  }
  
  enum ExpenseType {
    CASH
    CREDIT_CARD
    BANK_ACCOUNT
  }
  
  type Expense {
    id: String!
    amount: Float!
    billableDate: String!
    description: String
    currency: Currency!
    category: Category!
    type: ExpenseType!
    creditCard: CreditCard
    creditCardId: String
    bankAccount: BankAccount
    bankAccountId: String
  }
  
  enum SavingStatus {
    IN_PROGRESS
    COMPLETED
    NOT_CONCLUDED
    EXPIRED
  }
  
  type Saving {
    id: String!
    name: String!
    description: String
    targetAmount: Float!
    targetDate: String!
    status: SavingStatus!
    bankAccountId: String!
    bankAccount: BankAccount!
    currency: Currency!
  }
  
  type UserCurrency {
    id: String!
    code: String!
    expenses(fromDate: String, toDate: String): [Expense]!
    budget: Float!
  }

  type BudgetItemCurrency {
    currency: UserCurrency!
    limit: Float!
  }

  type BudgetItem {
    id: String!
    category: Category!
    currencies: [BudgetItemCurrency]!
  }

  type Budget {
    id: String!
    items: [BudgetItem]!
  }

  type Income {
    id: String!
    amount: Float!
    description: String
    incomeDate: String!
    bankAccount: BankAccount!
    currency: Currency!
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
    bankAccounts: [BankAccount]!
    creditCards(statuses: [CreditCardStatus]): [CreditCard]!
    creditCard(id: String!): CreditCard
    categories: [Category]!
    expenses(fromDate: String, toDate: String): [Expense]!
    incomes(fromDate: String, toDate: String): [Income]!
    savings(statuses: [SavingStatus]): [Saving]!
    budget: Budget
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
    updateBankAccountBalance(id: String!, balance: Float!): BankAccount!
    deleteBankAccount(id: String!): Boolean!
    
    createCreditCard(input: CreditCardInput!): CreditCard!
    updateCreditCard(id: String!, input: CreditCardInput!): CreditCard!
    deleteCreditCard(id: String!): Boolean!

    createCreditCardMonthlyStatement(creditCardId: String!, closeDate: String!): CreditCardMonthlyStatement

    createCreditCardStatementPayment(input: CreditCardStatementPaymentInput!): CreditCardStatementPayment
    deleteCreditCardStatementPayment(id: String!): Boolean
    
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: String!, input: CategoryInput!): Category!
    deleteCategory(id: String!): Boolean!
    
    createExpense(input: ExpenseInput!): Expense!
    deleteExpense(id: String!): Boolean!
    
    createSaving(input: SavingInput!): Saving!
    updateSaving(id: String!, input: SavingInput!): Saving!
    deleteSaving(id: String!): Boolean!

    createBudget: Budget
    updateBudgetCurrencies(id: String!, currencies: [String!]!): Budget
    upsertBudgetItem(input: BudgetItemInput!): BudgetItem
    deleteBudgetItem(id: String!, budgetId: String!): Boolean!
    
    createIncome(input: IncomeInput!): Income!
    deleteIncome(id: String!): Boolean!
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
    label: String!
    lastFourDigits: String = ""
    cardHolder: String = ""
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
    creditCardId: String
    bankAccountId: String
  }
  
  input SavingInput {
    name: String!
    description: String
    targetAmount: Float!
    targetDate: String!
    status: SavingStatus
    bankAccountId: String!
  }

  input BudgetItemCurrencyInput {
    currencyCode: String!
    limit: Float!
  }

  input BudgetItemInput {
    budgetId: String!
    categoryId: String!
    currencies: [BudgetItemCurrencyInput]!
  }

  input IncomeInput {
    amount: Float!
    description: String
    incomeDate: String!
    bankAccountId: String!
  }

  input CreditCardStatementPaymentItemCurrencyInput {
    currencyCode: String!
    type: CreditCardStatementPaymentType!
    amount: Float!
  }

  input CreditCardStatementPaymentInput {
    paymentDate: String!
    monthlyStatementId: String!
    currencies: [CreditCardStatementPaymentItemCurrencyInput]!
  }
`;
export default schema;
