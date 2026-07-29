import type { TopicContent } from "../types";

export const observer: TopicContent = {
  quickSummary: [
    "Observer defines a one-to-many dependency between objects so that when one object (the subject) changes state, all its dependents (observers) are notified and updated automatically.",
    "The pattern decouples the subject from its observers: the subject only knows the observer interface, not the concrete observer classes, enabling open-ended extensibility.",
    "Observer is the foundation of event-driven programming, GUI frameworks (event listeners), reactive streams (RxJS, Project Reactor), and the publish-subscribe messaging pattern.",
  ],
  detailed: [
    "The pattern has two key participants: Subject (also called Observable or Publisher) maintains a list of observers and provides methods to attach, detach, and notify them. Observer (also called Subscriber or Listener) defines an update interface that the subject calls when its state changes.",
    "In the push model, the subject sends the changed data directly to observers via the update method (e.g., update(temperature, humidity)). This is simple but couples observers to the specific data format. In the pull model, the subject sends a minimal notification (e.g., update(this)) and observers query the subject for the data they need. Pull is more flexible but requires more round trips.",
    "Memory leaks are a common pitfall: if observers register but never unregister (e.g., a destroyed UI component that still listens), the subject holds references that prevent garbage collection. This is the 'lapsed listener' problem. Always provide and use an unsubscribe/detach mechanism.",
    "Event-driven architectures generalize Observer to distributed systems: events are published to a bus or broker, and subscribers receive them asynchronously. This adds features like persistence, replay, and guaranteed delivery that the basic Observer pattern does not provide.",
    "The Observer pattern differs from Pub/Sub in coupling: in Observer, the subject directly references its observers. In Pub/Sub, an intermediary (message broker, event bus) decouples publishers from subscribers -- they do not know about each other.",
  ],
  deepDive: [
    "Reactive streams (RxJS, Project Reactor, Kotlin Flow) extend the Observer pattern with backpressure, error handling, and completion signals. Instead of just onNext(value), reactive observers implement onError(error) and onComplete(). Backpressure lets the observer signal the publisher to slow down when it cannot keep up, preventing out-of-memory errors in high-throughput systems.",
    "In the classic Observer pattern, notification order is typically undefined -- the subject iterates over its observer list, but the order may vary. If observers depend on being notified in a specific order, you need a priority mechanism or an explicit ordering constraint, which adds complexity.",
    "ConcurrentModificationException is a common bug: if an observer modifies the observer list during notification (e.g., by unsubscribing in its update method), iterating over the list throws an exception. Solutions include iterating over a snapshot (copy) of the list, using a concurrent collection, or deferring add/remove operations until after notification completes.",
    "The Observer pattern in JavaScript is built into the DOM: addEventListener and removeEventListener are the subscribe/unsubscribe operations, and the DOM element is the subject. EventEmitter in Node.js follows the same pattern with on(), off(), and emit().",
  ],
  code: [
    {
      language: "java",
      caption: "Type-safe Observer implementation with generics",
      source: `// Observer interface with generic event type
@FunctionalInterface
public interface Observer<T> {
    void update(T event);
}

// Subject base class
public class EventEmitter<T> {
    private final List<Observer<T>> observers = new CopyOnWriteArrayList<>();

    public void subscribe(Observer<T> observer) {
        observers.add(Objects.requireNonNull(observer));
    }

    public void unsubscribe(Observer<T> observer) {
        observers.remove(observer);
    }

    protected void emit(T event) {
        for (Observer<T> observer : observers) {
            try {
                observer.update(event);
            } catch (Exception e) {
                System.err.println("Observer error: " + e.getMessage());
                // Continue notifying other observers
            }
        }
    }
}

// Concrete event types
public record PriceUpdate(String symbol, double price, long timestamp) {}

// Concrete subject
public class StockTicker extends EventEmitter<PriceUpdate> {
    private final Map<String, Double> prices = new ConcurrentHashMap<>();

    public void updatePrice(String symbol, double newPrice) {
        double oldPrice = prices.getOrDefault(symbol, 0.0);
        prices.put(symbol, newPrice);

        if (oldPrice != newPrice) {
            emit(new PriceUpdate(symbol, newPrice, System.currentTimeMillis()));
        }
    }

    public double getPrice(String symbol) {
        return prices.getOrDefault(symbol, 0.0);
    }
}

// Concrete observers
public class PriceLogger implements Observer<PriceUpdate> {
    @Override
    public void update(PriceUpdate event) {
        System.out.printf("[LOG] %s: $%.2f at %d%n",
            event.symbol(), event.price(), event.timestamp());
    }
}

public class PriceAlertMonitor implements Observer<PriceUpdate> {
    private final Map<String, Double> alertThresholds;

    public PriceAlertMonitor(Map<String, Double> thresholds) {
        this.alertThresholds = thresholds;
    }

    @Override
    public void update(PriceUpdate event) {
        Double threshold = alertThresholds.get(event.symbol());
        if (threshold != null && event.price() > threshold) {
            System.out.printf("[ALERT] %s exceeded $%.2f (now $%.2f)%n",
                event.symbol(), threshold, event.price());
        }
    }
}

// Usage
StockTicker ticker = new StockTicker();
Observer<PriceUpdate> logger = new PriceLogger();
Observer<PriceUpdate> alerter = new PriceAlertMonitor(Map.of("AAPL", 200.0));

ticker.subscribe(logger);
ticker.subscribe(alerter);

ticker.updatePrice("AAPL", 195.50);  // Only logger fires
ticker.updatePrice("AAPL", 205.00);  // Both logger and alerter fire

ticker.unsubscribe(logger);  // Prevent memory leak`,
    },
    {
      language: "typescript",
      caption: "TypeScript EventEmitter with typed events and RxJS comparison",
      source: `// Type-safe event emitter with mapped event types
type EventMap = {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "order:placed": { orderId: string; total: number };
  "order:shipped": { orderId: string; trackingNumber: string };
};

class TypedEventEmitter<T extends Record<string, unknown>> {
  private listeners = new Map<keyof T, Set<(data: any) => void>>();

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function to prevent memory leaks
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      // Iterate over a snapshot to avoid concurrent modification
      for (const handler of [...handlers]) {
        try {
          handler(data);
        } catch (error) {
          console.error(\`Error in handler for \${String(event)}:\`, error);
        }
      }
    }
  }

  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Usage -- fully type-safe
const emitter = new TypedEventEmitter<EventMap>();

// TypeScript knows the handler parameter type
const unsubscribe = emitter.on("user:login", (data) => {
  console.log(\`User \${data.userId} logged in at \${data.timestamp}\`);
});

emitter.on("order:placed", (data) => {
  console.log(\`Order \${data.orderId} placed: $\${data.total}\`);
});

// Type-safe emit -- wrong data shape is a compile error
emitter.emit("user:login", { userId: "u-42", timestamp: new Date() });
emitter.emit("order:placed", { orderId: "ord-1", total: 99.99 });

// Clean up
unsubscribe();


// --- RxJS comparison: reactive streams extend Observer ---
import { Subject, filter, map, debounceTime } from "rxjs";

interface SearchEvent {
  query: string;
  timestamp: number;
}

const searchSubject = new Subject<SearchEvent>();

// RxJS adds operators for transformation, filtering, and backpressure
const searchResults$ = searchSubject.pipe(
  debounceTime(300),                          // Wait for typing pause
  map(event => event.query.trim()),           // Transform
  filter(query => query.length >= 3),         // Filter
);

const subscription = searchResults$.subscribe({
  next: (query) => console.log(\`Searching for: \${query}\`),
  error: (err) => console.error("Search error:", err),
  complete: () => console.log("Search stream completed"),
});

// Emit events
searchSubject.next({ query: "re", timestamp: Date.now() });    // Filtered (< 3 chars)
searchSubject.next({ query: "react", timestamp: Date.now() }); // Passes all filters

// Always unsubscribe to prevent memory leaks
subscription.unsubscribe();`,
    },
    {
      language: "python",
      caption: "Python Observer with weak references to prevent memory leaks",
      source: `import weakref
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Callable


# --- Classic Observer with weak references ---

class WeakObserverList:
    """Maintains weak references to observers, auto-cleaning dead refs."""
    def __init__(self) -> None:
        self._refs: list[weakref.ref] = []

    def add(self, observer: Any) -> None:
        self._refs.append(weakref.ref(observer, self._cleanup))

    def remove(self, observer: Any) -> None:
        self._refs = [r for r in self._refs if r() is not None and r() is not observer]

    def _cleanup(self, ref: weakref.ref) -> None:
        self._refs = [r for r in self._refs if r is not ref]

    def __iter__(self):
        # Yield only live references
        for ref in list(self._refs):
            obj = ref()
            if obj is not None:
                yield obj


@dataclass
class WeatherData:
    temperature: float
    humidity: float
    pressure: float


class WeatherStation:
    """Subject: notifies observers of weather changes."""
    def __init__(self) -> None:
        self._observers = WeakObserverList()
        self._data = WeatherData(0.0, 0.0, 0.0)

    def register(self, observer: "WeatherObserver") -> None:
        self._observers.add(observer)

    def remove(self, observer: "WeatherObserver") -> None:
        self._observers.remove(observer)

    def set_measurements(self, temp: float, humidity: float, pressure: float) -> None:
        self._data = WeatherData(temp, humidity, pressure)
        self._notify()

    def _notify(self) -> None:
        for observer in self._observers:
            observer.on_weather_update(self._data)


class WeatherObserver(ABC):
    @abstractmethod
    def on_weather_update(self, data: WeatherData) -> None: ...


class TemperatureDisplay(WeatherObserver):
    def on_weather_update(self, data: WeatherData) -> None:
        print(f"Temperature: {data.temperature:.1f} C")


class HumidityDisplay(WeatherObserver):
    def on_weather_update(self, data: WeatherData) -> None:
        print(f"Humidity: {data.humidity:.1f}%")


class ForecastDisplay(WeatherObserver):
    def __init__(self) -> None:
        self._last_pressure = 0.0

    def on_weather_update(self, data: WeatherData) -> None:
        trend = "rising" if data.pressure > self._last_pressure else "falling"
        print(f"Forecast: Pressure {trend} ({data.pressure:.1f} hPa)")
        self._last_pressure = data.pressure


# Usage
station = WeatherStation()
temp_display = TemperatureDisplay()
humidity_display = HumidityDisplay()
forecast = ForecastDisplay()

station.register(temp_display)
station.register(humidity_display)
station.register(forecast)

station.set_measurements(25.5, 65.0, 1013.0)
# Output:
# Temperature: 25.5 C
# Humidity: 65.0%
# Forecast: Pressure rising (1013.0 hPa)

# When display is garbage collected, it is auto-removed from observers
del humidity_display
station.set_measurements(26.0, 70.0, 1012.5)
# Output (no humidity line):
# Temperature: 26.0 C
# Forecast: Pressure falling (1012.5 hPa)`,
    },
  ],
  diagrams: [
    {
      title: "Observer pattern class structure",
      kind: "architecture",
      caption:
        "Shows Subject holding a list of Observer references, with attach/detach/notify methods. ConcreteSubject stores state and calls notify on change. ConcreteObservers implement the update method.",
    },
    {
      title: "Push vs Pull notification models",
      kind: "sequence",
      caption:
        "Push model: Subject passes data directly in update(data). Pull model: Subject sends update(this), and observers call subject.getState() to retrieve the specific data they need.",
    },
  ],
  animations: [
    {
      title: "Observer notification cycle",
      steps: [
        {
          label: "State change occurs in the subject",
          detail: "The subject's state is modified (e.g., temperature changes). This triggers the notification process.",
        },
        {
          label: "Subject iterates over observer list",
          detail: "The subject loops through its registered observers and calls update() on each one. Typically uses a snapshot of the list to avoid concurrent modification.",
        },
        {
          label: "Each observer processes the notification",
          detail: "Each concrete observer receives the update and reacts according to its own logic (display, log, trigger alert, etc.). Observers are independent of each other.",
        },
        {
          label: "Optional: observer unsubscribes",
          detail: "An observer may unsubscribe after receiving the notification (e.g., a one-shot handler). The subject removes it from the list to prevent future notifications and memory leaks.",
        },
      ],
    },
  ],
  comparison: {
    columns: ["Aspect", "Observer (GoF)", "Pub/Sub", "Reactive Streams (RxJS)", "Event Emitter (Node.js)"],
    rows: [
      ["Coupling", "Direct (subject knows observers)", "Indirect (via broker/bus)", "Indirect (via Observable chain)", "Direct (emitter knows listeners)"],
      ["Communication", "Synchronous (typically)", "Asynchronous (typically)", "Can be sync or async", "Synchronous by default"],
      ["Error handling", "Manual (try/catch in notify)", "Dead letter queues, retries", "onError handler in subscriber", "error event + uncaughtException"],
      ["Backpressure", "None", "Broker-managed (queue depth)", "Built-in (reactive pull)", "None"],
      ["Persistence", "None (in-memory)", "Optional (message broker)", "None (stream-based)", "None (in-memory)"],
      ["Use case", "In-process notifications", "Distributed systems, microservices", "Async data pipelines, UI events", "Node.js event handling"],
    ],
  },
  interviewQA: [
    {
      q: "What is the difference between Observer and Pub/Sub?",
      a: "In the Observer pattern, the subject directly maintains a list of observers and calls them when state changes -- they are coupled. In Pub/Sub, an intermediary (message broker, event bus) sits between publishers and subscribers. Publishers and subscribers do not know about each other, enabling looser coupling, asynchronous delivery, and cross-process communication.",
      followUps: [
        "When would you choose Observer over Pub/Sub?",
        "How does a message broker like RabbitMQ implement Pub/Sub?",
        "Can you combine both patterns in one system?",
      ],
    },
    {
      q: "How do you prevent memory leaks in the Observer pattern?",
      a: "Always unsubscribe observers when they are no longer needed (e.g., when a UI component is destroyed). Return an unsubscribe function or disposable from the subscribe method. Use weak references where the language supports them (Python's weakref, Java's WeakReference) so observers can be garbage collected even if they forget to unsubscribe.",
      followUps: [
        "What is the lapsed listener problem?",
        "How does Angular handle unsubscription with the AsyncPipe?",
        "How do weak references work for preventing observer leaks?",
      ],
    },
    {
      q: "What is the difference between push and pull models in Observer?",
      a: "In push, the subject sends the changed data directly in the notification (update(newTemperature, newHumidity)). Observers get all data whether they need it or not. In pull, the subject sends a minimal notification (update(this)) and observers query the subject for specific data they care about. Push is simpler; pull is more flexible and avoids sending unnecessary data.",
      followUps: [
        "Which model does Java's built-in Observable use?",
        "Which model does RxJS use?",
        "What are the performance implications of each model?",
      ],
    },
    {
      q: "How do reactive streams (RxJS, Reactor) extend the Observer pattern?",
      a: "Reactive streams add three key capabilities beyond basic Observer: error propagation (onError), completion signaling (onComplete), and backpressure (the subscriber can signal the publisher to slow down). They also provide a rich set of operators (map, filter, merge, debounce) for composing and transforming event streams declaratively.",
      followUps: [
        "What is backpressure, and why is it important?",
        "How does RxJS differ from Promises?",
        "What is the difference between hot and cold observables?",
      ],
    },
    {
      q: "How do you handle errors in observer notifications?",
      a: "Wrap each observer's update call in a try/catch so that one failing observer does not prevent others from being notified. Log the error and continue. In production systems, consider a dead-letter mechanism for persistently failing observers, and provide a way to report which observers are failing.",
      followUps: [
        "What happens if you do not catch observer exceptions?",
        "How does RxJS handle errors differently from try/catch?",
        "Should the subject retry failed notifications?",
      ],
    },
    {
      q: "Explain the Observer pattern in GUI frameworks with a concrete example.",
      a: "In a GUI, UI elements (buttons, text fields) are subjects that emit events. Event listeners are observers that subscribe to specific events. For example, button.addEventListener('click', handler) registers an observer (handler) for the click event on a button (subject). When the user clicks, the button notifies all registered handlers. The button does not know what the handlers do -- they might update a display, send a request, or log the action.",
      followUps: [
        "How does React's useState relate to Observer?",
        "What is event delegation in the DOM, and how does it relate to Observer?",
      ],
    },
  ],
  followUps: [
    "How does the Observer pattern relate to the Mediator pattern for managing complex inter-object communication?",
    "How do hot vs cold observables differ in RxJS, and what are the implications?",
    "How does event sourcing use the Observer pattern for building event-driven architectures?",
    "How do you implement an observer that batches notifications for efficiency (e.g., coalescing rapid updates)?",
    "How does Vue.js use the Observer pattern internally for its reactivity system?",
  ],
  mcqs: [
    {
      q: "What relationship does the Observer pattern define?",
      options: [
        "Many-to-many between objects",
        "One-to-one between a subject and an observer",
        "One-to-many where one subject notifies many observers",
        "Many-to-one where many subjects notify one observer",
      ],
      answerIndex: 2,
      explanation:
        "Observer defines a one-to-many dependency: one subject maintains a list of multiple observers and notifies all of them when its state changes.",
    },
    {
      q: "What is the lapsed listener problem?",
      options: [
        "Listeners receiving events out of order",
        "Listeners not receiving events fast enough",
        "Listeners that are never unregistered, preventing garbage collection and causing memory leaks",
        "Listeners that throw exceptions during notification",
      ],
      answerIndex: 2,
      explanation:
        "The lapsed listener problem occurs when observers register with a subject but are never unregistered. The subject holds strong references to them, preventing garbage collection even when the observers are no longer needed.",
    },
    {
      q: "In the push model of Observer, what does the subject send in the notification?",
      options: [
        "A reference to itself so observers can query it",
        "The changed data directly as parameters",
        "A message identifier for the observer to look up",
        "Nothing -- observers poll the subject periodically",
      ],
      answerIndex: 1,
      explanation:
        "In the push model, the subject sends the changed data directly in the update call (e.g., update(temperature, humidity)). Observers receive the data without needing to query the subject.",
    },
    {
      q: "How does Pub/Sub differ from the Observer pattern?",
      options: [
        "Pub/Sub is synchronous; Observer is asynchronous",
        "An intermediary (broker) decouples publishers from subscribers in Pub/Sub",
        "Observer supports multiple subscribers; Pub/Sub supports only one",
        "They are identical patterns with different names",
      ],
      answerIndex: 1,
      explanation:
        "In Pub/Sub, a message broker or event bus sits between publishers and subscribers, providing loose coupling. In Observer, the subject directly references and notifies its observers.",
    },
    {
      q: "What additional capability do reactive streams (RxJS) provide over the basic Observer pattern?",
      options: [
        "Type safety",
        "Backpressure, error propagation, and completion signals",
        "Automatic serialization",
        "Database persistence",
      ],
      answerIndex: 1,
      explanation:
        "Reactive streams extend Observer with onError (error propagation), onComplete (completion), and backpressure (subscriber controls flow rate). They also add declarative operators for stream transformation.",
    },
    {
      q: "Why should you iterate over a snapshot of the observer list during notification?",
      options: [
        "Snapshots are faster to iterate",
        "To prevent ConcurrentModificationException if an observer adds or removes observers during notification",
        "To guarantee notification order",
        "To support priority-based notification",
      ],
      answerIndex: 1,
      explanation:
        "If an observer modifies the observer list during notification (e.g., by unsubscribing itself), iterating over the live list throws ConcurrentModificationException. A snapshot (copy) avoids this.",
    },
  ],
  exercises: [
    "Implement a stock ticker system using the Observer pattern in Java. Create a StockMarket subject that notifies multiple displays (PriceBoard, PercentChangeDisplay, VolumeDisplay) when prices change. Include proper unsubscription and error handling.",
    "Build a TypeScript EventEmitter with typed events using a mapped type for the event-to-payload relationship. Ensure type safety so that subscribing to 'user:login' only accepts handlers with the correct payload type. Return an unsubscribe function from on().",
    "Create a Python weather station with weak-referenced observers. Demonstrate that when an observer is deleted (garbage collected), it is automatically removed from the notification list without explicit unsubscription.",
    "Implement a chat room system using both the Observer pattern (in-process) and a Pub/Sub pattern (with a simple message broker class). Compare the coupling, flexibility, and testability of the two approaches.",
  ],
  flashcards: [
    {
      front: "What is the Observer pattern?",
      back: "A behavioral pattern defining a one-to-many dependency where a subject notifies all registered observers automatically when its state changes.",
    },
    {
      front: "Push vs Pull model in Observer?",
      back: "Push: subject sends data directly in the notification. Pull: subject sends minimal notification, observers query the subject for data they need.",
    },
    {
      front: "What is the lapsed listener problem?",
      back: "Observers that register but never unregister, causing the subject to hold references that prevent garbage collection, leading to memory leaks.",
    },
    {
      front: "Observer vs Pub/Sub?",
      back: "Observer: subject directly references observers (coupled). Pub/Sub: broker intermediary decouples publishers from subscribers (loosely coupled).",
    },
    {
      front: "How do reactive streams extend Observer?",
      back: "They add error propagation (onError), completion signals (onComplete), backpressure, and declarative operators (map, filter, merge, debounce).",
    },
    {
      front: "How to prevent ConcurrentModificationException during notification?",
      back: "Iterate over a snapshot (copy) of the observer list, or use a concurrent collection like CopyOnWriteArrayList in Java.",
    },
  ],
  revisionNotes: [
    "Observer = one-to-many. Subject maintains observer list, calls update() on state change.",
    "Push model: subject sends data in update(). Pull model: subject sends update(this), observers query for data.",
    "Lapsed listener problem: unregistered observers cause memory leaks. Always unsubscribe. Consider weak references.",
    "Observer is direct coupling (subject knows observers). Pub/Sub adds a broker for loose coupling.",
    "Reactive streams (RxJS, Reactor) = Observer + error handling + completion + backpressure + operators.",
    "Iterate over a snapshot of observers during notification to avoid ConcurrentModificationException.",
  ],
  cheatSheet: [
    "Subject: attach(observer), detach(observer), notify() which iterates and calls update().",
    "Return an unsubscribe function from subscribe() to make cleanup easy.",
    "Use CopyOnWriteArrayList (Java) or [...listeners] spread (JS/TS) for safe iteration during notification.",
    "Wrap each observer.update() in try/catch so one failure does not block others.",
    "Push: update(data) -- simple but rigid. Pull: update(subject) -- flexible but more round trips.",
    "Weak references (Python weakref, Java WeakReference) auto-clean dead observers.",
    "RxJS: observable.pipe(operators).subscribe({ next, error, complete }) -- always call .unsubscribe().",
  ],
  resources: [
    {
      label: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
      kind: "book",
      note: "Original Observer pattern with MVC as the motivating example.",
    },
    {
      label: "Head First Design Patterns, 2nd Edition",
      kind: "book",
      note: "Uses a weather station example to build Observer intuition, covering both push and pull models.",
    },
    {
      label: "RxJS Documentation",
      kind: "docs",
      note: "Comprehensive guide to reactive streams in JavaScript, showing how Observer extends into a full reactive programming model.",
    },
    {
      label: "Refactoring Guru - Observer Pattern",
      kind: "article",
      note: "Visual guide with UML, real-world analogies, and implementations in multiple languages.",
    },
    {
      label: "Reactive Manifesto",
      kind: "article",
      note: "Defines the principles of reactive systems (responsive, resilient, elastic, message-driven) that build on Observer concepts.",
    },
  ],
  glossary: [
    {
      term: "Subject (Observable)",
      definition: "The object that maintains a list of observers and notifies them of state changes.",
    },
    {
      term: "Observer (Subscriber)",
      definition: "An object that registers with a subject to receive notifications when the subject's state changes.",
    },
    {
      term: "Push model",
      definition: "A notification approach where the subject sends changed data directly to observers in the update call.",
    },
    {
      term: "Pull model",
      definition: "A notification approach where the subject sends a minimal notification and observers query the subject for specific data.",
    },
    {
      term: "Lapsed listener",
      definition: "An observer that was registered but never unregistered, causing memory leaks because the subject holds a reference preventing garbage collection.",
    },
    {
      term: "Backpressure",
      definition: "A mechanism in reactive streams where the subscriber signals the publisher to control the rate of data emission, preventing overwhelm.",
    },
    {
      term: "Event bus",
      definition: "An intermediary that decouples event publishers from subscribers, implementing the Pub/Sub variation of the Observer pattern.",
    },
  ],
};
