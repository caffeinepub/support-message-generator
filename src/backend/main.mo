import Map "mo:core/Map";
import Text "mo:core/Text";


// Specify the data migration function in with-clause

actor {
  var store = Map.empty<Text, Text>();

  public shared ({ caller }) func setValue(key : Text, value : Text) : async () {
    store.add(key, value);
  };

  public shared ({ caller }) func getValue(key : Text) : async ?Text {
    store.get(key);
  };
};
