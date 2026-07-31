import type { TopicContent } from "../types";

export const separationOfConcerns: TopicContent = {
  quickSummary: [
    "Separation of Concerns (SoC) is a design principle that divides a program into distinct sections, each addressing a separate concern -- a cohesive area of functionality or responsibility.",
    "SoC can be applied horizontally (layered architecture: UI, business logic, data access) or vertically (feature-based slicing where each feature owns its full stack).",
    "Cross-cutting concerns like logging, authentication, and error handling span multiple modules and are typically handled via middleware, decorators, or aspect-oriented programming rather than being duplicated across layers.",
    "Proper SoC leads to higher cohesion within modules and lower coupling between them, making codebases easier to test, maintain, evolve, and reason about independently."
  ],

  detailed: [
    "Horizontal slicing organizes code into layers -- presentation, business logic, and data access. Each layer has a well-defined responsibility and communicates with adjacent layers through interfaces. This is the classical approach seen in enterprise Java (Controller -> Service -> Repository) and .NET applications. The advantage is a clear mental model, but it can lead to 'shotgun surgery' where a single feature change touches every layer.",
    "Vertical slicing groups code by feature or domain capability rather than technical layer. A 'checkout' module owns its own controller, service, repository, and even its own database schema. This approach aligns with Domain-Driven Design bounded contexts and microservice architecture. It reduces cross-team dependencies and makes features independently deployable, but can lead to code duplication if shared infrastructure is not properly extracted.",
    "MVC (Model-View-Controller), MVP (Model-View-Presenter), and MVVM (Model-View-ViewModel) are architectural patterns that apply SoC specifically to user interface development. MVC separates data (Model), display (View), and input handling (Controller). MVP introduces a Presenter that mediates all interaction, making the View passive and highly testable. MVVM uses data-binding between the View and a ViewModel, which is particularly powerful in reactive UI frameworks like WPF, SwiftUI, and Angular.",
    "Cross-cutting concerns are aspects of a program that affect multiple modules but do not fit neatly into any single one. Logging, security/authorization, transaction management, caching, validation, and error handling are classic examples. Without a strategy, these concerns get scattered across the codebase (code scattering) and tangled with business logic (code tangling), violating SoC.",
    "Aspect-Oriented Programming (AOP) addresses cross-cutting concerns by allowing behavior to be added to existing code without modifying it. AOP introduces concepts like join points (places where aspects can be applied), pointcuts (expressions selecting join points), advice (code to run at a pointcut -- before, after, or around), and weaving (the process of combining aspects with the main code at compile time, load time, or runtime). Spring AOP and AspectJ are prominent Java implementations.",
    "In frontend development, SoC manifests as separating structure (HTML), presentation (CSS), and behavior (JavaScript). Modern component-based frameworks like React and Vue challenge this by co-locating HTML, CSS, and JS within a single component -- arguing that the relevant concern is the component's feature, not its technical layer. This is vertical slicing applied to the frontend."
  ],

  deepDive: [
    "The tension between horizontal and vertical slicing reflects a deeper trade-off: horizontal slicing optimizes for technical consistency and reuse (all data access follows the same patterns), while vertical slicing optimizes for feature autonomy and team independence. In practice, mature systems use a hybrid -- vertical slicing for feature code with horizontal shared libraries for infrastructure concerns. Conway's Law suggests that team structure influences which slicing wins: teams organized by layer produce layered architectures; cross-functional teams produce vertically sliced ones.",
    "AOP weaving strategies have significant architectural implications. Compile-time weaving (AspectJ) modifies bytecode during compilation, offering the best runtime performance but requiring a special compiler. Load-time weaving instruments classes as the JVM loads them, balancing flexibility and performance. Runtime weaving, used by Spring AOP via JDK dynamic proxies or CGLIB, is the most flexible but only works on Spring-managed beans and method-level join points. Understanding these trade-offs is critical for choosing the right AOP strategy in production systems.",
    "The Dependency Inversion Principle (DIP) from SOLID is a key enabler of SoC. By depending on abstractions rather than concretions, high-level modules (business logic) do not depend on low-level modules (data access). Both depend on interfaces. This allows each concern to evolve independently. In hexagonal architecture (ports and adapters), the domain core defines ports (interfaces), and adapters implement them for specific technologies (REST, SQL, message queues). This is SoC taken to its architectural extreme -- the domain has zero knowledge of the infrastructure.",
    "Middleware pipelines in frameworks like Express.js, ASP.NET Core, and Django represent a runtime implementation of SoC for cross-cutting concerns. Each middleware component handles exactly one concern (CORS, authentication, rate limiting, request logging) and passes control to the next. The pipeline is composable and order-dependent -- authentication must run before authorization, which must run before the route handler. This pattern achieves separation without AOP's complexity, trading the generality of pointcut expressions for explicit pipeline configuration."
  ],

  code: [
    {
      language: "java",
      caption: "Spring AOP: Declarative logging as a cross-cutting concern using @Aspect",
      source: `import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(PerformanceLoggingAspect.class);

    // Pointcut: all public methods in any @Service class
    @Pointcut("execution(public * com.example..service.*.*(..))")
    public void serviceLayerMethods() {}

    // Around advice: measure execution time without touching business code
    @Around("serviceLayerMethods()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long start = System.nanoTime();

        try {
            Object result = joinPoint.proceed();
            long durationMs = (System.nanoTime() - start) / 1_000_000;
            log.info("{} completed in {} ms", methodName, durationMs);
            return result;
        } catch (Exception ex) {
            long durationMs = (System.nanoTime() - start) / 1_000_000;
            log.error("{} failed after {} ms: {}", methodName, durationMs, ex.getMessage());
            throw ex;
        }
    }
}`
    },
    {
      language: "typescript",
      caption: "Vertical slice architecture: A feature module owning its full stack (NestJS-style)",
      source: `// checkout/checkout.module.ts -- feature owns its controller, service, and repository
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CheckoutController } from "./checkout.controller";
import { CheckoutService } from "./checkout.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}

// checkout/checkout.controller.ts
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { CheckoutService } from "./checkout.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { AuthGuard } from "../shared/guards/auth.guard"; // shared cross-cutting concern

@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UseGuards(AuthGuard) // auth is a cross-cutting concern applied declaratively
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.checkoutService.placeOrder(dto);
  }
}

// checkout/checkout.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async placeOrder(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create({
      items: dto.items,
      total: dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
    return this.orderRepo.save(order);
  }
}`
    },
    {
      language: "cpp",
      caption: "Middleware pipeline: each middleware handles one cross-cutting concern",
      source: `// Middleware pipeline pattern in C++ (framework-agnostic concept)
#include <string>
#include <vector>
#include <functional>
#include <chrono>
#include <iostream>
#include <random>
#include <sstream>
#include <iomanip>
#include <stdexcept>

// Simplified request/response types
struct Request {
    std::string method, path;
    std::map<std::string, std::string> headers;
    std::map<std::string, std::string> state;
};

struct Response {
    int status_code = 200;
    std::string body;
    std::map<std::string, std::string> headers;
};

// Middleware: a function that wraps the next handler
using Handler = std::function<Response(Request&)>;
using Middleware = std::function<Handler(Handler)>;

// Concern 1: Request timing
Middleware timing_middleware() {
    return [](Handler next) -> Handler {
        return [next](Request& req) -> Response {
            auto start = std::chrono::steady_clock::now();
            auto resp = next(req);
            double ms = std::chrono::duration<double, std::milli>(
                std::chrono::steady_clock::now() - start).count();
            std::ostringstream oss;
            oss << std::fixed << std::setprecision(1) << ms;
            resp.headers["X-Process-Time-Ms"] = oss.str();
            std::cout << req.method << " " << req.path
                      << " -> " << resp.status_code
                      << " in " << oss.str() << "ms" << std::endl;
            return resp;
        };
    };
}

// Concern 2: Request ID correlation
Middleware correlation_id_middleware() {
    return [](Handler next) -> Handler {
        return [next](Request& req) -> Response {
            std::string request_id;
            if (auto it = req.headers.find("X-Request-ID");
                it != req.headers.end()) {
                request_id = it->second;
            } else {
                // Generate a simple unique ID
                static std::atomic<uint64_t> counter{0};
                request_id = "req-" + std::to_string(++counter);
            }
            req.state["request_id"] = request_id;
            auto resp = next(req);
            resp.headers["X-Request-ID"] = request_id;
            return resp;
        };
    };
}

// Concern 3: Error normalization
Middleware error_handling_middleware() {
    return [](Handler next) -> Handler {
        return [next](Request& req) -> Response {
            try {
                return next(req);
            } catch (const std::exception& e) {
                std::cerr << "Unhandled error on " << req.path
                          << ": " << e.what() << std::endl;
                return {500, R"({"error": "Internal server error"})", {}};
            }
        };
    };
}

// Compose middleware into a pipeline -- order matters
Handler compose(Handler handler, std::vector<Middleware> middlewares) {
    // Apply in reverse so the first middleware is outermost
    for (auto it = middlewares.rbegin(); it != middlewares.rend(); ++it)
        handler = (*it)(handler);
    return handler;
}

// Pure business logic handler
Response get_order(Request& req) {
    return {200, R"({"order_id": 42, "status": "shipped"})", {}};
}

int main() {
    auto pipeline = compose(get_order, {
        error_handling_middleware(),   // outermost: catches all errors
        correlation_id_middleware(),   // adds request ID before processing
        timing_middleware(),           // innermost: times only the handler
    });

    Request req{"GET", "/orders/42", {}, {}};
    Response resp = pipeline(req);
}`
    }
  ],

  diagrams: [
    {
      title: "Horizontal vs Vertical Slicing",
      kind: "architecture",
      caption: "Horizontal layers slice by technical concern (presentation, business, data). Vertical slices cut through all layers per feature, creating independent feature modules."
    },
    {
      title: "MVC / MVP / MVVM Pattern Comparison",
      kind: "flow",
      caption: "Data and control flow differences: MVC has triangular communication, MVP routes everything through the Presenter, and MVVM uses two-way data binding between View and ViewModel."
    }
  ],

  animations: [
    {
      title: "How AOP Weaving Intercepts a Method Call",
      steps: [
        { label: "Client invokes method", detail: "A caller invokes orderService.placeOrder(). The call targets what it believes is the actual service object." },
        { label: "Proxy intercepts", detail: "The call is received by a dynamically generated proxy (CGLIB or JDK Proxy) that wraps the real service. The proxy holds a chain of applicable advice." },
        { label: "Before advice executes", detail: "The proxy checks its pointcut registry. The @Before advice on the logging aspect matches, so it runs first -- logging method entry and arguments." },
        { label: "Target method executes", detail: "The proxy calls proceed(), which invokes the real placeOrder() method on the actual service instance with the original arguments." },
        { label: "After/AfterReturning advice executes", detail: "After the method returns, @AfterReturning advice runs -- logging the return value and execution time. If an exception was thrown, @AfterThrowing advice runs instead." },
        { label: "Result returned to client", detail: "The proxy returns the result (or re-throws the exception) to the original caller, which is unaware that any interception occurred." }
      ]
    }
  ],

  comparison: {
    columns: ["Aspect", "MVC", "MVP", "MVVM"],
    rows: [
      ["View-Model relationship", "View reads Model directly", "View is passive, Presenter pushes data", "View binds to ViewModel properties"],
      ["Testability", "Controller testable, View hard to test", "Presenter fully testable with mock View", "ViewModel testable without View framework"],
      ["Data flow", "Triangular: Controller -> Model -> View", "Linear: View <-> Presenter <-> Model", "Reactive: View <-> ViewModel -> Model"],
      ["Coupling", "View coupled to Model", "View coupled to Presenter interface", "View loosely coupled via data binding"],
      ["Typical usage", "Rails, Spring MVC, Django", "Android (legacy), WinForms", "WPF, Angular, SwiftUI, Knockout.js"],
      ["Complexity", "Low -- simple to understand", "Medium -- more boilerplate for Presenter", "Medium-High -- requires binding framework"],
      ["View logic location", "Split between View and Controller", "All in Presenter", "All in ViewModel with binding expressions"]
    ]
  },

  interviewQA: [
    {
      q: "What is Separation of Concerns and why is it important?",
      a: "SoC is a design principle that advocates dividing a system into distinct sections, each handling one well-defined responsibility. It is important because it reduces cognitive load (developers work on one concern at a time), improves maintainability (changes to one concern do not ripple through unrelated code), enables parallel development (teams can work on different concerns independently), and improves testability (each concern can be tested in isolation).",
      followUps: [
        "Can you give an example of a system that violates SoC and explain the consequences?",
        "How does SoC relate to the Single Responsibility Principle?"
      ]
    },
    {
      q: "What is the difference between horizontal and vertical slicing?",
      a: "Horizontal slicing divides code by technical layers -- presentation, business logic, data access. All features share the same layers. Vertical slicing divides code by feature or business capability -- each feature owns its own presentation, logic, and data access. Horizontal slicing promotes technical consistency and reuse but creates cross-layer coupling for feature changes. Vertical slicing promotes feature autonomy and independent deployability but can lead to duplication of infrastructure patterns. Most mature systems use a hybrid: vertical feature slices with horizontally shared libraries for cross-cutting infrastructure.",
      followUps: [
        "How does vertical slicing relate to microservices?",
        "When would you choose horizontal over vertical slicing?"
      ]
    },
    {
      q: "How do you handle cross-cutting concerns without violating SoC?",
      a: "Cross-cutting concerns like logging, authentication, and caching span multiple modules and cannot be cleanly isolated into a single layer. Strategies include: (1) Middleware/interceptor pipelines -- compose concerns as ordered pipeline stages (Express, ASP.NET Core). (2) AOP -- use aspects with pointcut expressions to inject behavior at join points without modifying target code (Spring AOP, AspectJ). (3) Decorators/annotations -- declaratively apply concerns at the class or method level (@Transactional, @Cacheable). (4) Dependency injection -- inject cross-cutting services and let a DI container manage their lifecycle. The goal is to define each concern once and apply it declaratively rather than scattering it across the codebase.",
      followUps: [
        "What are the downsides of AOP?",
        "How do you debug issues when behavior is added via aspects?"
      ]
    },
    {
      q: "Compare MVC, MVP, and MVVM. When would you use each?",
      a: "MVC: The Controller handles user input, updates the Model, and the View observes the Model for changes. Best for server-side web (Rails, Django, Spring MVC) where the request-response cycle naturally fits the pattern. MVP: The Presenter acts as a middleman -- the View is passive and delegates all logic to the Presenter. Best when you need highly testable UI logic without a binding framework, as in legacy Android or desktop apps. MVVM: The ViewModel exposes observable properties and commands, and the View binds to them declaratively. Best with frameworks that support data binding natively (Angular, WPF, SwiftUI). The choice depends on the platform's binding capabilities and the team's testing requirements.",
      followUps: [
        "How does React's component model relate to these patterns?",
        "Can you use MVVM without a framework's binding support?"
      ]
    },
    {
      q: "What is Aspect-Oriented Programming and how does it relate to SoC?",
      a: "AOP is a programming paradigm that modularizes cross-cutting concerns into units called aspects. An aspect encapsulates behavior (advice) that would otherwise be scattered across multiple classes. It uses pointcut expressions to declaratively specify where the behavior should apply (join points). AOP directly supports SoC by allowing cross-cutting logic like logging, transaction management, and security to be defined once and applied transparently, keeping business logic clean. The key concepts are: join point (a point in execution like a method call), pointcut (a predicate selecting join points), advice (code to execute at a pointcut), and weaving (combining aspects with application code).",
      followUps: [
        "What are the risks of overusing AOP?",
        "How does Spring AOP differ from AspectJ?"
      ]
    },
    {
      q: "How does hexagonal architecture (ports and adapters) implement SoC?",
      a: "Hexagonal architecture places the domain/business logic at the center, surrounded by ports (interfaces defining how the domain interacts with the outside world) and adapters (concrete implementations of those ports). Inbound adapters (REST controllers, CLI handlers, message consumers) translate external requests into domain operations. Outbound adapters (database repositories, API clients, message producers) implement persistence and integration. The domain has zero dependencies on frameworks or infrastructure -- it only knows about its own ports. This achieves SoC at the architectural level: the domain concern is completely isolated from delivery mechanism and infrastructure concerns, and any adapter can be swapped without touching the domain.",
      followUps: [
        "How does hexagonal architecture compare to clean architecture?",
        "How do you test the domain layer in hexagonal architecture?"
      ]
    }
  ],

  followUps: [
    "How does SoC apply in microservices vs monolithic architectures?",
    "What is the relationship between SoC and the SOLID principles?",
    "How do modern component-based frameworks (React, Vue) challenge traditional SoC boundaries?",
    "When does SoC become over-engineering, and how do you recognize that boundary?",
    "How does event-driven architecture relate to Separation of Concerns?",
    "What role does Dependency Injection play in enforcing SoC?",
    "How do you apply SoC in database design (e.g., schema per bounded context)?"
  ],

  mcqs: [
    {
      q: "Which of the following is a cross-cutting concern?",
      options: [
        "Order total calculation",
        "Logging and monitoring",
        "Product catalog display",
        "User registration flow"
      ],
      answerIndex: 1,
      explanation: "Logging and monitoring affect every module in the system and cannot be cleanly isolated into a single feature or layer. The other options are feature-specific concerns that belong to a single vertical slice."
    },
    {
      q: "In vertical slicing, how is code organized?",
      options: [
        "By technical layer (controllers, services, repositories)",
        "By feature or business capability, each owning its full stack",
        "By programming language used",
        "By the team that wrote it"
      ],
      answerIndex: 1,
      explanation: "Vertical slicing groups all technical layers (controller, service, repository) under a single feature module. This contrasts with horizontal slicing, which groups by technical layer across all features."
    },
    {
      q: "What is 'weaving' in Aspect-Oriented Programming?",
      options: [
        "Writing aspect code in a separate file",
        "The process of combining aspects with main application code",
        "Defining pointcut expressions",
        "Running unit tests on aspects"
      ],
      answerIndex: 1,
      explanation: "Weaving is the process by which aspect code (advice) is combined with the target application code at specified join points. It can occur at compile time (AspectJ), load time (LTW), or runtime (Spring AOP proxies)."
    },
    {
      q: "In MVVM, what is the primary role of the ViewModel?",
      options: [
        "To directly manipulate DOM elements",
        "To expose observable state and commands that the View binds to",
        "To handle HTTP requests from the client",
        "To manage database connections"
      ],
      answerIndex: 1,
      explanation: "The ViewModel exposes data and commands as observable properties. The View binds to these declaratively, so the ViewModel has no direct reference to the View, enabling testability and clean separation."
    },
    {
      q: "Which pattern makes the View completely passive, delegating all UI logic?",
      options: [
        "MVC -- the View observes the Model",
        "MVVM -- the View binds to the ViewModel",
        "MVP -- the View delegates everything to the Presenter",
        "Flux -- the View dispatches actions"
      ],
      answerIndex: 2,
      explanation: "In MVP, the View is a thin shell that forwards all user interactions to the Presenter and implements a simple interface for the Presenter to push display data back. This makes the View passive and the Presenter fully testable."
    },
    {
      q: "What problem does the middleware pipeline pattern solve for SoC?",
      options: [
        "It compiles code faster by parallelizing layers",
        "It composes cross-cutting concerns as ordered, independent pipeline stages",
        "It eliminates the need for a database layer",
        "It replaces the need for unit testing"
      ],
      answerIndex: 1,
      explanation: "Middleware pipelines let each cross-cutting concern (auth, logging, CORS, error handling) be implemented as an independent, composable stage. Each middleware does one thing and passes control to the next, cleanly separating concerns without AOP complexity."
    }
  ],

  exercises: [
    "Take a monolithic Express.js or Flask application with authentication checks, logging, and error handling scattered across route handlers. Refactor it to extract each cross-cutting concern into its own middleware, leaving route handlers with only business logic. Measure the reduction in lines of code per handler.",
    "Implement the same feature (e.g., a 'create user' endpoint) in both a horizontally sliced project structure (controllers/, services/, repositories/ folders) and a vertically sliced one (users/ module with its own controller, service, repository). Compare how many files you touch when adding a new field to the user entity.",
    "Using Spring AOP or a TypeScript decorator library, create an aspect/decorator that adds retry logic with exponential backoff to any method annotated with @Retryable. The aspect should handle transient exceptions, log each retry attempt, and give up after a configurable number of attempts.",
    "Build a simple MVVM implementation in vanilla TypeScript: create a ViewModel class with observable properties, a View class that binds to those properties and updates the DOM, and a Model class that fetches data. Demonstrate that the ViewModel can be fully unit-tested without any DOM."
  ],

  flashcards: [
    { front: "What is a 'concern' in Separation of Concerns?", back: "A concern is a cohesive area of functionality or responsibility in a system -- such as data persistence, user authentication, input validation, or business rule enforcement. Each concern should be addressed by a distinct, well-encapsulated module." },
    { front: "Horizontal slicing vs. Vertical slicing", back: "Horizontal: code organized by technical layer (UI, business, data). Vertical: code organized by feature/domain capability, each feature owning its full stack. Horizontal optimizes for technical consistency; vertical optimizes for feature autonomy." },
    { front: "What is a join point in AOP?", back: "A join point is a well-defined point in program execution where an aspect can be applied -- typically a method call, method execution, field access, or exception throw. In Spring AOP, only method execution join points are supported." },
    { front: "What is a pointcut in AOP?", back: "A pointcut is a predicate expression that selects a set of join points where advice should be applied. Example: execution(* com.example.service.*.*(..)) selects all method executions in the service package." },
    { front: "MVC View vs. MVP View", back: "In MVC, the View actively observes and reads from the Model. In MVP, the View is passive -- it has no knowledge of the Model and only implements a simple interface that the Presenter uses to push data to it." },
    { front: "What is 'code scattering'?", back: "Code scattering occurs when the implementation of a single concern (e.g., logging) is spread across many modules in the codebase. It is a symptom of poor SoC for cross-cutting concerns and is one of the problems AOP aims to solve." },
    { front: "What is 'code tangling'?", back: "Code tangling occurs when a single module contains code addressing multiple concerns (e.g., a service method that mixes business logic with logging, caching, and transaction management). It is the complement of code scattering." },
    { front: "What are the three types of AOP weaving?", back: "Compile-time weaving (AspectJ compiler modifies bytecode), load-time weaving (agent instruments classes as the JVM loads them), and runtime weaving (framework creates proxies around target objects, as in Spring AOP)." }
  ],

  revisionNotes: [
    "SoC is about dividing a system so each part addresses one concern. High cohesion within modules, low coupling between them.",
    "Horizontal slicing = layers (Controller/Service/Repository). Vertical slicing = feature modules (each feature owns its full stack). Most real systems are a hybrid.",
    "Cross-cutting concerns (logging, auth, transactions, caching) violate clean layering because they span all modules. Handle them with middleware pipelines, AOP, decorators, or DI -- never by copying code into every handler.",
    "AOP key terms: Join point (where), Pointcut (which ones), Advice (what to do -- before/after/around), Weaving (how to combine). Spring AOP uses runtime proxies; AspectJ uses compile-time or load-time weaving.",
    "MVC: View observes Model, Controller handles input. MVP: Presenter mediates everything, View is passive. MVVM: ViewModel exposes observables, View binds declaratively. Choose based on platform binding support and testability needs.",
    "Hexagonal/ports-and-adapters architecture is SoC at the system level: domain at the center depends on nothing; ports define interfaces; adapters implement infrastructure. Domain is independently testable.",
    "Modern component frameworks (React, Vue) co-locate HTML/CSS/JS per component. This is vertical slicing at the UI level -- the concern is the component's feature, not its technology."
  ],

  cheatSheet: [
    "SoC = one module, one responsibility. If a module has two reasons to change, it addresses two concerns -- split it.",
    "Horizontal layers: Presentation -> Business Logic -> Data Access. Communication flows through interfaces, never skips layers.",
    "Vertical slices: Feature/ owns Controller + Service + Repository + Entities. Shared infra lives in a common/ or shared/ module.",
    "Cross-cutting concern checklist: logging, authentication, authorization, caching, transaction management, error handling, validation, rate limiting, metrics/monitoring.",
    "AOP formula: Aspect = Pointcut (where to apply) + Advice (what to do). Weaving = compile-time | load-time | runtime.",
    "Spring AOP: @Aspect + @Component on the class. @Before/@After/@Around on methods. Pointcut expressions select targets. Only works on Spring beans.",
    "Middleware pipeline order matters: error handling (outermost) -> CORS -> auth -> rate limiting -> route handler (innermost).",
    "MVC: View knows Model. MVP: View knows only Presenter interface. MVVM: View knows only ViewModel observables.",
    "Test SoC quality: Can you test each concern in isolation without mocking the entire system? Can you change one concern without modifying unrelated code?"
  ],

  resources: [
    { label: "Clean Architecture by Robert C. Martin", kind: "book", note: "Definitive guide to separating business rules from delivery mechanisms and frameworks using the Dependency Rule." },
    { label: "Aspect-Oriented Software Development with Use Cases by Ivar Jacobson", kind: "book", note: "Foundational text on applying AOP principles in software design, bridging use cases and aspects." },
    { label: "Spring AOP Documentation", kind: "docs", note: "Official reference for Spring's proxy-based AOP support, including pointcut expressions, advice types, and integration with Spring IoT." },
    { label: "Vertical Slice Architecture by Jimmy Bogard", kind: "article", note: "Blog post and talk explaining why organizing by feature rather than layer leads to more maintainable applications, with practical MediatR examples." },
    { label: "Hexagonal Architecture by Alistair Cockburn", kind: "article", note: "Original description of the ports and adapters pattern, explaining how to isolate domain logic from external dependencies." }
  ],

  glossary: [
    { term: "Separation of Concerns (SoC)", definition: "A design principle that divides a program into distinct sections, each addressing a separate, cohesive area of functionality." },
    { term: "Cross-cutting concern", definition: "A concern that affects multiple modules and cannot be cleanly decomposed into a single module -- such as logging, security, or transaction management." },
    { term: "Aspect", definition: "In AOP, a modular unit that encapsulates a cross-cutting concern, consisting of pointcuts and advice." },
    { term: "Join point", definition: "A point in program execution (e.g., method call, field access) where an aspect's advice can be applied." },
    { term: "Pointcut", definition: "A predicate expression in AOP that selects a set of join points where advice should run." },
    { term: "Advice", definition: "The action taken by an aspect at a particular join point. Types include before, after, after-returning, after-throwing, and around." },
    { term: "Weaving", definition: "The process of combining aspects with application code at compile time, load time, or runtime." },
    { term: "Horizontal slicing", definition: "Organizing code by technical layer (presentation, business logic, data access), where each layer spans all features." },
    { term: "Vertical slicing", definition: "Organizing code by feature or business capability, where each slice owns its entire technical stack." },
    { term: "Code scattering", definition: "When the implementation of a single concern is spread across multiple modules in the codebase." },
    { term: "Code tangling", definition: "When a single module mixes code from multiple unrelated concerns, reducing readability and maintainability." }
  ]
};
