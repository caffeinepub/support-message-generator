import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";

module {
  type Role = {
    #user;
    #agent;
  };

  type Message = {
    role : Role;
    content : Text;
    timestamp : Int;
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

  type OldActor = {
    chatSessions : Map.Map<Text, List.List<Message>>;
    inventory : Map.Map<Text, Nat>;
  };

  type NewActor = {
    chatSessions : Map.Map<Text, List.List<Message>>;
    inventory : Map.Map<Text, Nat>;
    expensesStore : Map.Map<Principal, List.List<Expense>>;
    profilesStore : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      chatSessions = old.chatSessions;
      inventory = old.inventory;
      expensesStore = Map.empty<Principal, List.List<Expense>>();
      profilesStore = Map.empty<Principal, UserProfile>();
    };
  };
};
