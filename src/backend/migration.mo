import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  type Role = {
    #user;
    #agent;
  };

  type OldMessage = {
    role : Role;
    content : Text;
    timestamp : Int;
  };

  type OldActor = {
    chatSessions : Map.Map<Text, List.List<OldMessage>>;
  };

  type NewMessage = OldMessage;

  type NewActor = {
    chatSessions : Map.Map<Text, List.List<NewMessage>>;
    inventory : Map.Map<Text, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    let inventory = Map.empty<Text, Nat>();
    // Add sample data
    inventory.add("SKU-001", 10); // 10 units
    inventory.add("SKU-002", 0); // Out of stock
    inventory.add("SKU-003", 30);
    inventory.add("SKU-004", 25);
    inventory.add("SKU-005", 50);
    inventory.add("SKU-006", 45);
    inventory.add("SKU-007", 14);
    inventory.add("SKU-008", 5);
    inventory.add("SKU-009", 0); // Out of stock
    inventory.add("SKU-010", 5);
    inventory.add("SKU-011", 35);

    { old with inventory };
  };
};
