import type { TopicContent } from "../types";

export const interfaceSegregation: TopicContent = {
  quickSummary: [
    "Clients should not be forced to depend on interfaces they do not use -- prefer many small, focused interfaces over one large, general-purpose one.",
    "Fat interfaces force implementers to provide stub or no-op methods for capabilities they don't support, leading to LSP violations.",
    "ISP promotes role interfaces: each interface represents a specific capability or role rather than a complete set of operations.",
    "ISP is the interface-level analog of SRP -- just as classes should have one reason to change, interfaces should serve one client role."
  ],
  detailed: [
    "Robert C. Martin introduced ISP in the context of a real Xerox printer system where a single Job interface required every class to implement print, staple, and fax methods, even if the class only handled printing. The solution was to split the interface into Printable, Stapleable, and Faxable -- clients depend only on what they use.",
    "Fat interfaces create several problems: (1) Implementers must write no-op or exception-throwing methods for unsupported operations (violating LSP). (2) Changes to any method in the interface force all implementers to recompile/redeploy, even if the change is irrelevant to them. (3) Clients are exposed to methods they don't need, creating coupling and confusion.",
    "ISP is achieved by splitting large interfaces into smaller, cohesive ones. A class can implement multiple interfaces, so splitting does not limit capability -- it just ensures each client depends on only the capabilities it needs. This is the 'role interface' pattern: each interface describes a specific role an object can play.",
    "In languages without interfaces (JavaScript, Python), ISP still applies conceptually. Use protocols, abstract base classes, or duck typing to define focused capability contracts. TypeScript's structural typing makes ISP particularly natural -- you can define narrow types inline without formal interface declarations.",
    "ISP has a direct relationship with SRP: a fat interface often signals that the implementing class has multiple responsibilities. Splitting the interface can reveal SRP violations in the implementation. Conversely, applying SRP to a class often naturally leads to ISP-compliant interfaces."
  ],
  deepDive: [
    "ISP and the Dependency Inversion Principle work together to minimize coupling. DIP says depend on abstractions; ISP says those abstractions should be narrow and client-specific. Without ISP, depending on a fat abstraction still creates unnecessary coupling -- you are nominally decoupled from the implementation but still coupled to irrelevant method signatures.",
    "In microservices architecture, ISP manifests as API segregation. A monolithic API that serves both mobile clients, web clients, and internal services with the same endpoint structure violates ISP at the service level. The Backend for Frontend (BFF) pattern applies ISP: each client type gets a tailored API surface that includes only the data and operations it needs.",
    "ISP has compile-time and runtime implications. In statically typed languages (Java, C#), depending on a fat interface means your module must be recompiled when any method in that interface changes, even irrelevant ones. This is the 'recompilation dependency' problem. Narrow interfaces minimize this blast radius. In dynamically typed languages, the cost is conceptual -- developers must understand a larger surface area than necessary.",
    "The Adapter pattern often pairs with ISP: when you must integrate with a fat third-party interface, create a narrow adapter interface in your domain and implement it with an adapter class that delegates to the fat interface. Your code depends on the narrow interface; the adapter handles the translation. This isolates your codebase from the fat interface's churn."
  ],
  code: [
    {
      language: "java",
      caption: "ISP violation: fat MultiFunctionDevice interface",
      source: `// FAT INTERFACE: forces all devices to implement every method
public interface MultiFunctionDevice {
    void print(Document doc);
    void scan(Document doc);
    void fax(Document doc);
    void staple(Document doc);
    void copy(Document doc);
}

// A simple printer must implement methods it cannot support
public class BasicPrinter implements MultiFunctionDevice {
    @Override
    public void print(Document doc) {
        System.out.println("Printing: " + doc.getName());
    }

    @Override
    public void scan(Document doc) {
        throw new UnsupportedOperationException("BasicPrinter cannot scan");
    }

    @Override
    public void fax(Document doc) {
        throw new UnsupportedOperationException("BasicPrinter cannot fax");
    }

    @Override
    public void staple(Document doc) {
        throw new UnsupportedOperationException("BasicPrinter cannot staple");
    }

    @Override
    public void copy(Document doc) {
        throw new UnsupportedOperationException("BasicPrinter cannot copy");
    }
}

// A client that only needs printing is forced to depend on scan, fax, etc.
public class PrintService {
    private final MultiFunctionDevice device; // depends on fat interface

    public PrintService(MultiFunctionDevice device) {
        this.device = device;
    }

    public void printDocument(Document doc) {
        device.print(doc); // only uses print, but depends on 5-method interface
    }
}`
    },
    {
      language: "java",
      caption: "ISP applied: segregated role interfaces",
      source: `// Segregated interfaces -- each represents one capability
public interface Printer {
    void print(Document doc);
}

public interface Scanner {
    byte[] scan(Document doc);
}

public interface Fax {
    void fax(Document doc, String recipient);
}

public interface Stapler {
    void staple(Document doc);
}

// Simple printer only implements what it supports
public class BasicPrinter implements Printer {
    @Override
    public void print(Document doc) {
        System.out.println("Printing: " + doc.getName());
    }
}

// Multi-function device implements all relevant interfaces
public class OfficePrinter implements Printer, Scanner, Fax, Stapler {
    @Override
    public void print(Document doc) {
        System.out.println("Printing: " + doc.getName());
    }

    @Override
    public byte[] scan(Document doc) {
        System.out.println("Scanning: " + doc.getName());
        return new byte[0]; // placeholder
    }

    @Override
    public void fax(Document doc, String recipient) {
        System.out.println("Faxing to " + recipient + ": " + doc.getName());
    }

    @Override
    public void staple(Document doc) {
        System.out.println("Stapling: " + doc.getName());
    }
}

// Clients depend only on the interface they need
public class PrintService {
    private final Printer printer; // narrow dependency

    public PrintService(Printer printer) {
        this.printer = printer;
    }

    public void printDocument(Document doc) {
        printer.print(doc);
    }
}

public class ScanService {
    private final Scanner scanner; // narrow dependency

    public ScanService(Scanner scanner) {
        this.scanner = scanner;
    }

    public byte[] scanDocument(Document doc) {
        return scanner.scan(doc);
    }
}`
    },
    {
      language: "typescript",
      caption: "ISP in TypeScript: worker interfaces segregated by capability",
      source: `// FAT INTERFACE violation
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeReport(): void;
}

// A robot worker cannot eat or sleep -- forced to throw or no-op
class Robot implements Worker {
  work(): void { console.log("Working..."); }
  eat(): void { /* no-op -- robots don't eat */ }
  sleep(): void { /* no-op -- robots don't sleep */ }
  attendMeeting(): void { /* no-op */ }
  writeReport(): void { /* no-op */ }
}

// ISP APPLIED: segregated interfaces
interface Workable {
  work(): void;
}

interface Feedable {
  eat(meal: string): void;
}

interface Restable {
  sleep(hours: number): void;
}

interface Reportable {
  writeReport(topic: string): string;
}

interface MeetingAttendee {
  attendMeeting(meetingId: string): void;
}

// Human implements all relevant interfaces
class HumanWorker implements Workable, Feedable, Restable, Reportable, MeetingAttendee {
  work(): void { console.log("Human working"); }
  eat(meal: string): void { console.log(\`Eating \${meal}\`); }
  sleep(hours: number): void { console.log(\`Sleeping \${hours} hours\`); }
  writeReport(topic: string): string { return \`Report on \${topic}\`; }
  attendMeeting(meetingId: string): void { console.log(\`In meeting \${meetingId}\`); }
}

// Robot only implements what it can actually do
class RobotWorker implements Workable {
  work(): void { console.log("Robot working efficiently"); }
}

// Supervisor service depends only on what it needs
class SupervisorService {
  assignWork(workers: Workable[]): void {
    workers.forEach(w => w.work());
  }
}

// Cafeteria service depends only on Feedable
class CafeteriaService {
  serveLunch(diners: Feedable[]): void {
    diners.forEach(d => d.eat("lunch"));
  }
}

// Type-safe: Robot cannot be passed to CafeteriaService
const human = new HumanWorker();
const robot = new RobotWorker();
const supervisor = new SupervisorService();
supervisor.assignWork([human, robot]); // both are Workable
// cafeteria.serveLunch([robot]); // compile error: Robot is not Feedable`
    }
  ],
  diagrams: [
    {
      title: "Fat Interface vs Segregated Interfaces",
      kind: "architecture",
      caption: "A fat MultiFunctionDevice forces all implementers to stub unsupported methods. Splitting into Printer, Scanner, Fax, and Stapler lets each class implement only what it can support.",
      mermaid: `graph TD
    subgraph Fat["Fat Interface - ISP Violation"]
      MFD["MultiFunctionDevice\nprint, scan, fax, staple, copy"]
      BP["BasicPrinter\nprint OK\nscan - throws\nfax - throws\nstaple - throws\ncopy - throws"]
      MFD --> BP
    end
    subgraph Segregated["Segregated Interfaces - ISP Compliant"]
      PR["Printer\nprint"]
      SC["Scanner\nscan"]
      FX["Fax\nfax"]
      ST["Stapler\nstaple"]
      BPR["BasicPrinter\nimplements Printer only"]
      OFP["OfficePrinter\nimplements all four"]
      PR --> BPR
      PR --> OFP
      SC --> OFP
      FX --> OFP
      ST --> OFP
    end`,
    },
    {
      title: "Client Dependency on Role Interfaces",
      kind: "network",
      caption: "Each client depends only on the narrow interface it needs. PrintService depends on Printer, ScanService on Scanner. A change to Scanner does not force PrintService to recompile.",
      mermaid: `graph LR
    PS["PrintService"]
    SS["ScanService"]
    FS["FaxService"]
    PR["Printer\ninterface"]
    SC["Scanner\ninterface"]
    FX["Fax\ninterface"]
    OP["OfficePrinter\nimplements all"]
    BP["BasicPrinter\nimplements Printer"]
    PS -->|depends on| PR
    SS -->|depends on| SC
    FS -->|depends on| FX
    PR -.->|implemented by| OP
    SC -.->|implemented by| OP
    FX -.->|implemented by| OP
    PR -.->|implemented by| BP`,
    },
    {
      title: "Adapter Pattern for Fat Third-Party Interfaces",
      kind: "sequence",
      caption: "When a fat third-party interface cannot be changed, an Adapter wraps it and exposes only the narrow interface your code depends on.",
      mermaid: `sequenceDiagram
    participant Client as PrintService
    participant NarrowI as Printer interface
    participant Adapter as PrinterAdapter
    participant Fat as ThirdPartyMFD
    Client->>NarrowI: print(doc)
    NarrowI->>Adapter: print(doc)
    Adapter->>Fat: performPrint(doc)
    Fat-->>Adapter: result
    Adapter-->>NarrowI: result
    NarrowI-->>Client: done
    Note over Adapter,Fat: Adapter shields client from fat interface churn`,
    },
    {
      title: "ISP Relationship to SOLID Principles",
      kind: "mindmap",
      caption: "ISP is the interface-level analog of SRP and reinforces DIP and LSP. Understanding its connections to the rest of SOLID clarifies when and why to apply it.",
      mermaid: `mindmap
    root((ISP))
      Violations
        Fat interfaces
        UnsupportedOperationException
        No-op method stubs
        Recompilation blast radius
      Solutions
        Role interfaces
        Capability-named interfaces
        Adapter for third-party fat APIs
        Backend for Frontend at API level
      Relationships
        SRP
          Interface-level analog
          Fat interface signals SRP violation
        LSP
          No-op methods violate LSP
          ISP prevents forced stubs
        DIP
          Narrow interfaces reduce coupling
          Depend on minimal abstractions`,
    },
  ],
  animations: [
    {
      title: "Splitting a Fat Interface",
      steps: [
        { label: "Identify the fat interface", detail: "Find an interface with many methods where different implementers only use subsets. Look for no-op methods, UnsupportedOperationException, or 'not applicable' comments." },
        { label: "Group by client usage", detail: "Examine which clients use which methods. Group methods that are always used together by the same clients. Each group becomes a candidate for a separate interface." },
        { label: "Create role interfaces", detail: "Extract each group into its own interface with a name reflecting the role/capability (Printable, Scannable, Faxable, not IPrinterPart1, IPrinterPart2)." },
        { label: "Update implementations", detail: "Each class now implements only the interfaces it can support. Multi-capable classes implement multiple interfaces. No more no-op methods." },
        { label: "Update clients", detail: "Each client's dependency changes from the fat interface to the specific role interface it uses. Compile-time safety ensures no client accidentally uses unsupported methods." }
      ]
    }
  ],
  comparison: {
    columns: ["Aspect", "Fat Interface", "Segregated Interfaces (ISP)"],
    rows: [
      ["Implementer burden", "Must implement all methods, even irrelevant ones", "Only implements interfaces matching its capabilities"],
      ["Client coupling", "Depends on methods it never calls", "Depends only on methods it actually uses"],
      ["LSP compliance", "No-op/throwing methods violate LSP", "Each interface's contract is fully honored"],
      ["Recompilation", "Any method change forces all dependents to recompile", "Change only affects dependents of the changed interface"],
      ["Discoverability", "Large interface with many methods is hard to navigate", "Small interfaces with clear names are easy to understand"],
      ["Flexibility", "All-or-nothing implementation", "Mix and match capabilities as needed"],
      ["Testing", "Must mock entire fat interface", "Mock only the narrow interface needed by the test"]
    ]
  },
  interviewQA: [
    {
      q: "What is the Interface Segregation Principle?",
      a: "ISP states that no client should be forced to depend on methods it does not use. Large, fat interfaces should be split into smaller, focused ones that each serve a specific client role. This minimizes coupling, prevents LSP violations from no-op implementations, and reduces the blast radius of interface changes.",
      followUps: [
        "What is the origin of ISP (the Xerox printer story)?",
        "How is ISP different from SRP?"
      ]
    },
    {
      q: "What problems do fat interfaces cause?",
      a: "Fat interfaces cause: (1) Implementers must write stub or exception-throwing methods for unsupported operations, violating LSP. (2) Clients depend on methods they never call, creating unnecessary coupling. (3) Any change to the interface forces recompilation/redeployment of all dependents. (4) Testing requires mocking a large surface area. (5) The interface is harder to understand and navigate.",
      followUps: [
        "How does a fat interface lead to LSP violations?",
        "What is the recompilation dependency problem?"
      ]
    },
    {
      q: "How do you identify ISP violations?",
      a: "Look for: (1) Classes that implement an interface but throw UnsupportedOperationException for some methods. (2) Methods with empty bodies or 'return null' in interface implementations. (3) Clients that use only a small subset of an interface's methods. (4) Interfaces whose methods can be grouped into distinct clusters used by different clients. (5) Test mocks that stub most methods as no-ops.",
      followUps: [
        "What metrics can help identify fat interfaces?",
        "Is there a tool that detects ISP violations?"
      ]
    },
    {
      q: "What is a role interface?",
      a: "A role interface defines a specific capability or role an object can play, rather than the full set of operations the object supports. For example, instead of a single Employee interface, you might have Payable, Reviewable, and Schedulable interfaces. A class implements whichever roles it supports. Clients depend on the specific role they need.",
      followUps: [
        "How do role interfaces compare to header interfaces?",
        "Can role interfaces lead to too many interfaces?"
      ]
    },
    {
      q: "How does ISP relate to SRP?",
      a: "ISP is the interface-level analog of SRP. SRP says a class should have one reason to change; ISP says an interface should serve one client role. A fat interface often signals that the implementing class has multiple responsibilities (SRP violation). Splitting the interface often reveals and drives splitting the implementation. They reinforce each other.",
      followUps: [
        "Can you have ISP-compliant interfaces but SRP-violating implementations?",
        "How do ISP and DIP work together?"
      ]
    },
    {
      q: "How does ISP apply in dynamically typed languages like Python or JavaScript?",
      a: "Even without formal interfaces, ISP applies conceptually. Use Python's Protocol or ABC with focused method sets. In JavaScript/TypeScript, define narrow type aliases or interfaces. Duck typing naturally supports ISP -- a function that expects only a 'read()' method does not force the object to also have 'write()'. TypeScript's structural typing makes this explicit: you can define narrow inline types.",
      followUps: [
        "What is Python's Protocol and how does it enable ISP?",
        "How does TypeScript's Pick utility type relate to ISP?"
      ]
    }
  ],
  followUps: [
    "How does the Adapter pattern help when you must work with a fat third-party interface?",
    "What is the Backend for Frontend (BFF) pattern and how does it apply ISP at the API level?",
    "How many interfaces is too many? When does ISP lead to interface explosion?",
    "How does ISP apply to GraphQL API design?",
    "What is the difference between a role interface and a header interface?",
    "How does TypeScript's Pick<T, K> utility type relate to ISP?"
  ],
  mcqs: [
    {
      q: "What does ISP primarily aim to prevent?",
      options: [
        "Classes with too many methods",
        "Clients depending on interface methods they do not use",
        "Too many classes in a system",
        "Using inheritance instead of composition"
      ],
      answerIndex: 1,
      explanation: "ISP focuses on preventing unnecessary dependencies: clients should depend only on the interface methods they actually use."
    },
    {
      q: "What is a fat interface?",
      options: [
        "An interface with too many implementations",
        "An interface that extends multiple other interfaces",
        "A large, general-purpose interface that bundles unrelated methods together",
        "An interface that uses generics"
      ],
      answerIndex: 2,
      explanation: "A fat interface groups methods serving different client needs into one interface, forcing all implementers to deal with all methods."
    },
    {
      q: "Which symptom most directly indicates an ISP violation?",
      options: [
        "A class has too many private methods",
        "An implementing class throws UnsupportedOperationException for some interface methods",
        "An interface has generic type parameters",
        "A class implements only one interface"
      ],
      answerIndex: 1,
      explanation: "UnsupportedOperationException in interface method implementations means the class was forced to implement methods it cannot support -- a direct ISP violation."
    },
    {
      q: "What is a role interface?",
      options: [
        "An interface with only one method",
        "An interface defining a specific capability an object can play",
        "An interface used only for testing",
        "An interface that every class must implement"
      ],
      answerIndex: 1,
      explanation: "A role interface represents a specific capability (Printable, Sortable, Serializable) rather than the full set of object operations."
    },
    {
      q: "How does ISP relate to the recompilation dependency problem?",
      options: [
        "ISP has no effect on compilation",
        "Fat interfaces force all dependents to recompile when any method changes; ISP minimizes this blast radius",
        "ISP increases recompilation because there are more interfaces",
        "ISP only applies to interpreted languages"
      ],
      answerIndex: 1,
      explanation: "With fat interfaces, changing any method forces all dependents to recompile. With segregated interfaces, only dependents of the changed interface are affected."
    },
    {
      q: "Which SOLID principle does ISP most directly prevent violations of?",
      options: [
        "SRP",
        "OCP",
        "LSP",
        "DIP"
      ],
      answerIndex: 2,
      explanation: "Fat interfaces force implementers to provide no-op or throwing implementations for unsupported methods, which violates LSP. ISP prevents this by ensuring implementers only commit to methods they can support."
    }
  ],
  exercises: [
    "Refactor a fat UserService interface that includes authenticate(), getProfile(), updateProfile(), deleteAccount(), sendVerificationEmail(), and generateReport() into segregated role interfaces. Identify which clients use which methods.",
    "Design an animal simulation system where different animals have different capabilities (fly, swim, run, climb, hunt). Use ISP to create focused interfaces so that each animal class only implements the capabilities it has.",
    "Given a repository interface with findById(), findAll(), save(), update(), delete(), and bulkImport() methods, split it into ReadRepository, WriteRepository, and BulkRepository. Show how a read-only service depends only on ReadRepository.",
    "Analyze a real open-source Java project's interfaces. Find at least one fat interface, propose how to split it, and discuss the impact on existing implementations and clients."
  ],
  flashcards: [
    { front: "What is the Interface Segregation Principle?", back: "Clients should not be forced to depend on methods they do not use. Prefer many small, focused interfaces over one large, general-purpose one." },
    { front: "What is a fat interface?", back: "A large interface that bundles methods serving different client needs. Implementers must deal with all methods even if they only support a subset." },
    { front: "What is a role interface?", back: "An interface that defines a specific capability or role an object can play (e.g., Printable, Sortable), rather than the full set of object operations." },
    { front: "How does ISP relate to SRP?", back: "ISP is the interface-level analog of SRP. SRP says classes have one reason to change; ISP says interfaces should serve one client role. They reinforce each other." },
    { front: "How does ISP prevent LSP violations?", back: "Fat interfaces force implementers to provide no-op or throwing methods for unsupported operations, violating LSP. ISP ensures implementers only commit to methods they can support." },
    { front: "What is the recompilation dependency problem?", back: "In statically typed languages, depending on a fat interface means recompiling when any method changes. ISP minimizes the blast radius by narrowing dependencies." },
    { front: "What is the origin story of ISP?", back: "Robert C. Martin encountered the problem at Xerox, where a single Job interface forced every class to implement print, staple, and fax methods. He proposed splitting into focused interfaces." }
  ],
  revisionNotes: [
    "ISP: no client should be forced to depend on methods it does not use.",
    "Fat interfaces force no-op implementations, violating LSP.",
    "Split fat interfaces into role interfaces -- each representing one capability.",
    "A class can implement multiple role interfaces to compose capabilities.",
    "ISP is the interface-level analog of SRP.",
    "ISP reduces the blast radius of interface changes (recompilation dependency).",
    "In dynamic languages, ISP applies through focused ABCs, protocols, or duck typing.",
    "The Adapter pattern bridges between fat third-party interfaces and ISP-compliant domain interfaces."
  ],
  cheatSheet: [
    "If a class throws UnsupportedOperationException for interface methods, the interface is too fat.",
    "Split interfaces by client usage: group methods that are always used together.",
    "Name interfaces by role/capability: Printable, Sortable, Cacheable -- not IPart1, IPart2.",
    "A class implementing 5 focused interfaces is better than implementing 1 fat interface.",
    "Clients should depend on the narrowest interface that serves their needs.",
    "Use the Adapter pattern to shield your code from fat third-party interfaces.",
    "ISP + DIP: depend on narrow abstractions for maximum decoupling."
  ],
  resources: [
    { label: "Agile Software Development by Robert C. Martin", kind: "book", note: "Chapter on ISP with the Xerox printer origin story." },
    { label: "Clean Architecture by Robert C. Martin", kind: "book", note: "ISP in the context of component and architecture design." },
    { label: "Refactoring.Guru -- Interface Segregation Principle", url: "https://refactoring.guru/", kind: "article", note: "Visual walkthrough with code examples." },
    { label: "Role Interfaces (Martin Fowler)", url: "https://martinfowler.com/", kind: "article", note: "Fowler's discussion of role interfaces vs header interfaces." },
    { label: "SOLID Principles in TypeScript (DigitalOcean)", kind: "article", note: "ISP examples using TypeScript's structural type system." }
  ],
  glossary: [
    { term: "Interface Segregation Principle (ISP)", definition: "Clients should not be forced to depend on interface methods they do not use." },
    { term: "Fat Interface", definition: "A large, general-purpose interface that bundles methods serving different client needs, forcing implementers to handle all methods." },
    { term: "Role Interface", definition: "A focused interface representing a specific capability or role (e.g., Printable, Cacheable) rather than the full set of object operations." },
    { term: "Header Interface", definition: "An interface that mirrors the full public API of a class, often too broad for any single client's needs." },
    { term: "Recompilation Dependency", definition: "The problem where changes to an interface force recompilation of all dependents, even those unaffected by the change." },
    { term: "Client-Specific Interface", definition: "An interface designed for a particular client's needs, containing only the methods that client uses." },
    { term: "Backend for Frontend (BFF)", definition: "An architectural pattern applying ISP at the API level: each client type (mobile, web) gets a tailored API surface." }
  ]
};
