import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Int "mo:core/Int";

module {
  // Original actor type (old)
  type OldActor = {
    store : Map.Map<Text, Text>;
  };

  type Role = {
    #user;
    #agent;
  };

  type Message = {
    role : Role;
    content : Text;
    timestamp : Int;
  };

  type ChatHistory = List.List<Message>;
  type SessionId = Text;

  // New actor type (new)
  type NewActor = {
    chatSessions : Map.Map<SessionId, ChatHistory>;
  };

  // Migration function called by the main actor via the with-clause
  public func run(_old : OldActor) : NewActor {
    // Initialize chat sessions as empty
    let chatSessions = Map.empty<SessionId, ChatHistory>();
    { chatSessions };
  };
};
