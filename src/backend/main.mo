import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Principal "mo:core/Principal";



actor {
  type Role = {
    #user;
    #agent;
  };

  type Message = {
    role : Role;
    content : Text;
    timestamp : Int;
  };

  type SessionId = Text;

  let chatSessions = Map.empty<SessionId, List.List<Message>>();

  let inventory = Map.empty<Text, Nat>();

  func createMessage(role : Role, content : Text) : Message {
    {
      role;
      content;
      timestamp = Time.now();
    };
  };

  // Generate a unique session ID (for simplicity, use timestamp)
  public func createSession() : async SessionId {
    let sessionId = Time.now().toText();
    let sessionHistory = List.empty<Message>();
    chatSessions.add(sessionId, sessionHistory);
    sessionId;
  };

  // Add a message to a session
  public func addMessage(sessionId : SessionId, role : Role, content : Text) : async Bool {
    let message = createMessage(role, content);
    switch (chatSessions.get(sessionId)) {
      case (null) { false };
      case (?history) {
        let newHistory = history.clone();
        newHistory.add(message);
        chatSessions.add(sessionId, newHistory);
        true;
      };
    };
  };

  // Add user message and generate agent response
  public func addUserMessageWithResponse(sessionId : SessionId, userContent : Text) : async Text {
    let userMessage = createMessage(#user, userContent);
    switch (chatSessions.get(sessionId)) {
      case (null) { "" };
      case (?history) {
        let updatedHistory = history.clone();
        updatedHistory.add(userMessage);
        let agentResponse = generateAIResponse(userContent);
        let agentMessage = createMessage(#agent, agentResponse);
        updatedHistory.add(agentMessage);
        chatSessions.add(sessionId, updatedHistory);
        agentResponse;
      };
    };
  };

  public func getSessionMessages(sessionId : SessionId) : async [Message] {
    switch (chatSessions.get(sessionId)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  public func clearSession(sessionId : SessionId) : async Bool {
    if (not chatSessions.containsKey(sessionId)) { return false };
    let newSessionHistory = List.empty<Message>();
    chatSessions.add(sessionId, newSessionHistory);
    true;
  };

  func generateAIResponse(userMessage : Text) : Text {
    // Track order
    if (isOrderTracking(userMessage)) {
      return "To check your order status, please provide your order number. Order tracking is available through your account or confirmation email.";
    };

    // Return
    if (isReturnRequest(userMessage)) {
      return "To initiate a return, please visit our Returns Portal or provide your order number. We'll guide you through the process.";
    };

    // Refund
    if (isRefundRequest(userMessage)) {
      return "Refunds are processed after we receive the returned items. It may take 5-7 business days to reflect in your account.";
    };

    // Shipping delay
    if (isShippingDelay(userMessage)) {
      return "Shipping delays can occur due to various reasons. Please allow 1-2 days for tracking updates. If it's delayed beyond that, contact customer support.";
    };

    // Product quality / defect
    if (isProductQualityIssue(userMessage)) {
      return "Sorry to hear about the product issue. Please provide details and photos if possible. We'll work to resolve it quickly.";
    };

    // Damaged item
    if (isDamagedItem(userMessage)) {
      return "If you received a damaged item, please send a photo to our support email. We'll arrange a replacement or refund.";
    };

    // Cancellation
    if (isCancellation(userMessage)) {
      return "To cancel an order, please provide your order number. Orders can only be cancelled before shipping.";
    };

    // Billing/payment issue
    if (isBillingIssue(userMessage)) {
      return "For billing concerns, please share your order number and details of the issue. We'll investigate and resolve it.";
    };

    // Account/login help
    if (isAccountHelp(userMessage)) {
      return "If you need help with your account, use the 'Forgot Password' link on the login page. For further assistance, contact support at [support email].";
    };

    // Discount/Price match
    if (isDiscountRequest(userMessage)) {
      return "We offer various promotions. If you missed a discount, provide your order number and we'll review your request.";
    };

    // FAQ Question
    if (isFAQ(userMessage)) {
      return "For frequently asked questions about shipping, returns and products, please visit our FAQ page on the website.";
    };

    // Fallback response
    "I'm sorry, I didn't quite understand your request. Could you please provide more details or clarify your issue?";
  };

  func isOrderTracking(text : Text) : Bool {
    containsAny(text, ["track", "order status", "shipping status", "where is my order", "track order"]);
  };

  func isReturnRequest(text : Text) : Bool {
    containsAny(text, ["return item", "return order", "return package", "initiate return", "exchange"]);
  };

  func isRefundRequest(text : Text) : Bool {
    containsAny(text, ["refund", "get my money back", "returned item", "refund status"]);
  };

  func isShippingDelay(text : Text) : Bool {
    containsAny(text, ["shipment delay", "late delivery", "shipping status", "package not arrived"]);
  };

  func isProductQualityIssue(text : Text) : Bool {
    containsAny(text, ["defective", "broken", "issue", "not working", "quality problem"]);
  };

  func isDamagedItem(text : Text) : Bool {
    containsAny(text, ["damaged", "broken", "received damaged", "item damaged"]);
  };

  func isCancellation(text : Text) : Bool {
    containsAny(text, ["cancel order", "cancel my order", "order cancellation", "stop purchase"]);
  };

  func isBillingIssue(text : Text) : Bool {
    containsAny(text, ["billing", "payment issue", "charged twice", "wrong charge", "payment problem"]);
  };

  func isAccountHelp(text : Text) : Bool {
    containsAny(text, ["account help", "login issues", "reset password", "account access"]);
  };

  func isDiscountRequest(text : Text) : Bool {
    containsAny(text, ["discount", "coupon", "promo code", "price match", "deal"]);
  };

  func isFAQ(text : Text) : Bool {
    containsAny(text, ["faq", "question", "help", "information", "about"]);
  };

  func containsAny(text : Text, keywords : [Text]) : Bool {
    for (keyword in keywords.values()) {
      if (text.contains(#text keyword)) { return true };
    };
    false;
  };

  public query ({ caller }) func checkInventory(sku : Text) : async ?Nat {
    inventory.get(sku);
  };

  public query ({ caller }) func getAllInventory() : async [(Text, Nat)] {
    inventory.toArray();
  };

  public shared ({ caller }) func addInventoryItem(sku : Text, units : Nat) : async Bool {
    if (sku.size() == 0) { return false };
    inventory.add(sku, units);
    true;
  };

  type Expense = {
    id : Text;
    category : Text;
    amount : Float;
    notes : Text;
    date : Text;
    timestamp : Int;
  };

  type UserProfile = {
    monthlyIncome : Float;
    fixedExpenses : Float;
    savingsGoal : Float;
    goalName : Text;
    currentSavings : Float;
  };

  public shared ({ caller }) func addExpense(principal : Principal, category : Text, amount : Float, notes : Text, date : Text) : async Expense {
    let newExpense : Expense = {
      id = Time.now().toText();
      category;
      amount;
      notes;
      date;
      timestamp = Time.now();
    };
    let userExpenses = switch (expensesStore.get(principal)) {
      case (null) { List.empty<Expense>() };
      case (?list) { list.clone() };
    };
    userExpenses.add(newExpense);
    expensesStore.add(principal, userExpenses);
    newExpense;
  };

  let expensesStore = Map.empty<Principal, List.List<Expense>>();
  // Use explicit update method instead of direct size manipulation.

  public query ({ caller }) func getExpenses(principal : Principal) : async [Expense] {
    switch (expensesStore.get(principal)) {
      case (null) { [] };
      case (?userExpenses) {
        let sortableArray = userExpenses.toArray();
        sortableArray.sort(
          func(a, b) {
            Int.compare(b.timestamp, a.timestamp);
          }
        );
      };
    };
  };

  public shared ({ caller }) func deleteExpense(principal : Principal, id : Text) : async Bool {
    switch (expensesStore.get(principal)) {
      case (null) { false };
      case (?userExpenses) {
        let remainingExpenses = userExpenses.filter(
          func(expense) { expense.id != id }
        );
        if (remainingExpenses.size() == userExpenses.size()) {
          false;
        } else {
          expensesStore.add(principal, remainingExpenses);
          true;
        };
      };
    };
  };

  let profilesStore = Map.empty<Principal, UserProfile>();

  public shared ({ caller }) func saveProfile(principal : Principal, monthlyIncome : Float, fixedExpenses : Float, savingsGoal : Float, goalName : Text, currentSavings : Float) : async Bool {
    let profile : UserProfile = {
      monthlyIncome;
      fixedExpenses;
      savingsGoal;
      goalName;
      currentSavings;
    };
    profilesStore.add(principal, profile);
    true;
  };

  public query ({ caller }) func getProfile(principal : Principal) : async ?UserProfile {
    profilesStore.get(principal);
  };
};
