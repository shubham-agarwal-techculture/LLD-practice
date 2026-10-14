// Comprehensive LLD Scenarios Database for Daily Practice
export const LLD_SCENARIOS = [
  {
    id: 'parking-lot',
    dayIndex: 1,
    title: 'Design a Multi-Floor Smart Parking Lot',
    difficulty: 'Medium',
    company: 'Amazon / Google / Uber',
    estimatedTime: '45 mins',
    category: 'Object-Oriented Design & Strategy',
    tags: ['Strategy Pattern', 'Factory Pattern', 'Concurrency', 'SOLID', 'Observer Pattern'],
    summary: 'Design an automated, multi-level parking lot facility capable of handling different vehicle types, dynamic spot allocation strategies, entry/exit gates, ticketing, and hourly rate calculations.',
    realWorldContext: 'Urban airports and shopping malls need intelligent parking systems that avoid bottlenecks at gates, assign the optimal parking spot nearest to the entry point, handle concurrent reservations without race conditions, and support multiple payment strategies.',
    
    requirements: {
      functional: [
        'Support multiple parking floors, each with varying spot types (Compact for Cars, Large for Trucks/Buses, Two-Wheeler for Bikes, Electric with EV charging).',
        'Support multiple entry and exit gates operating concurrently.',
        'At entry gate, issue a ParkingTicket with unique ID, entry timestamp, vehicle details, and assigned spot.',
        'Spot allocation strategy should be pluggable (e.g., Nearest to Gate, Lowest Floor First, or Random).',
        'At exit gate, calculate parking fee based on duration, vehicle type, and pricing strategy (e.g., Flat Rate, Hourly, Peak/Surge Pricing).',
        'Support multiple payment methods (Credit Card, Cash, UPI, Fastag).',
        'Real-time Display Board at entrance showing available spots per floor and type.'
      ],
      nonFunctional: [
        'Thread-Safety: Concurrent vehicles entering or exiting must not be allocated the same parking spot (Race condition prevention).',
        'Extensibility: Easy to introduce new vehicle types (e.g., Autonomous Pod, Handicap) or new pricing strategies without modifying core classes (Open/Closed Principle).',
        'High Availability & Low Latency: Gate ticket issuance must execute in < 100ms.',
        'Fault Tolerance: If gate hardware or payment gateway fails, fallback gracefully.'
      ],
      outOfScope: [
        'Hardware sensors integration protocol (assume sensor pushes state via an API interface).',
        'Physical boom barrier motor controller circuitry.'
      ],
      clarifyingQuestions: [
        {
          q: 'Can a bike park in a car spot if bike spots are full?',
          a: 'By default no, strict spot type matching is enforced. However, an allocation policy can be configured to allow degradation with a penalty fee.',
          hint: 'Design a SpotAssignmentStrategy interface to make this rule easily swappable.'
        },
        {
          q: 'How do we handle two cars arriving at two different entry gates at the exact same millisecond when only 1 spot remains?',
          a: 'Use atomic check-and-reserve operations (e.g., synchronized block, ReentrantLock on spot state, or Redis atomic SETNX in distributed environments).',
          hint: 'Spot state should transition atomically: AVAILABLE -> RESERVED -> OCCUPIED.'
        },
        {
          q: 'Is pricing flat or does it change dynamically by time spent or peak hours?',
          a: 'Pricing should follow the Strategy Pattern so hourly, flat-rate, or dynamic surge pricing can be injected seamlessly.',
          hint: 'Implement `PricingStrategy` interface with `calculateFee(ParkingTicket ticket)`.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'Driver / Customer', role: 'Enters lot, takes ticket, parks vehicle, makes payment at exit' },
        { name: 'Parking Attendant', role: 'Assists with manual ticket validation and payment overrides' },
        { name: 'System Admin', role: 'Configures floors, rates, spot allocation rules, and monitors occupancy' }
      ],
      coreEntities: [
        {
          name: 'Vehicle (Abstract)',
          description: 'Base class for any vehicle entering the facility.',
          attributes: ['licensePlate: string', 'type: VehicleType (BIKE, CAR, TRUCK, EV)'],
          methods: ['getType(): VehicleType', 'getLicensePlate(): string'],
          relationships: ['Extended by Car, Bike, Truck, ElectricCar']
        },
        {
          name: 'ParkingSpot (Abstract)',
          description: 'Represents a physical parking stall with state management.',
          attributes: ['spotId: string', 'floorNumber: int', 'type: SpotType', 'isOccupied: boolean', 'currentVehicle: Vehicle'],
          methods: ['assignVehicle(Vehicle v): boolean', 'removeVehicle(): void', 'isAvailable(): boolean'],
          relationships: ['Has 1-to-1 association with current Vehicle. Contained in ParkingFloor.']
        },
        {
          name: 'ParkingFloor',
          description: 'Represents an entire level containing multiple categorized spots.',
          attributes: ['floorId: int', 'spotsMap: Map<SpotType, List<ParkingSpot>>', 'displayBoard: DisplayBoard'],
          methods: ['getAvailableSpot(SpotType type): Optional<ParkingSpot>', 'updateDisplayBoard(): void'],
          relationships: ['Composition: ParkingFloor contains multiple ParkingSpots.']
        },
        {
          name: 'ParkingTicket',
          description: 'Issued upon entry, tracks arrival, spot, and calculates billing.',
          attributes: ['ticketId: string', 'entryTime: DateTime', 'exitTime: DateTime', 'vehicle: Vehicle', 'assignedSpot: ParkingSpot', 'amountDue: double', 'status: TicketStatus'],
          methods: ['closeTicket(DateTime exitTime, double fee): void'],
          relationships: ['References Vehicle and ParkingSpot.']
        },
        {
          name: 'ParkingLot (Singleton)',
          description: 'Root orchestrator maintaining gates, floors, strategies, and global state.',
          attributes: ['instance: ParkingLot', 'floors: List<ParkingFloor>', 'entryGates: List<EntryGate>', 'exitGates: List<ExitGate>', 'allocationStrategy: SpotAllocationStrategy', 'pricingStrategy: PricingStrategy'],
          methods: ['enterVehicle(Vehicle v, EntryGate gate): ParkingTicket', 'exitVehicle(ParkingTicket t, ExitGate gate, PaymentMethod m): Receipt'],
          relationships: ['Manages Floors, Gates, and Strategies.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction TB
    class ParkingLot {
      -static ParkingLot instance
      -List~ParkingFloor~ floors
      -SpotAllocationStrategy allocationStrategy
      -PricingStrategy pricingStrategy
      +static getInstance() ParkingLot
      +parkVehicle(Vehicle) ParkingTicket
      +unparkVehicle(ParkingTicket) Receipt
    }
    class ParkingFloor {
      -int floorId
      -Map~SpotType, List~ParkingSpot~~ spots
      -DisplayBoard displayBoard
      +getAvailableSpot(SpotType) ParkingSpot
    }
    class ParkingSpot {
      <<abstract>>
      -string spotId
      -boolean isAvailable
      -Vehicle vehicle
      +occupy(Vehicle)
      +vacate()
    }
    class CompactSpot
    class LargeSpot
    class BikeSpot
    ParkingSpot <|-- CompactSpot
    ParkingSpot <|-- LargeSpot
    ParkingSpot <|-- BikeSpot

    class Vehicle {
      <<abstract>>
      -string licensePlate
      -VehicleType type
    }
    class Car
    class Bike
    class Truck
    Vehicle <|-- Car
    Vehicle <|-- Bike
    Vehicle <|-- Truck

    class SpotAllocationStrategy {
      <<interface>>
      +findSpot(List~ParkingFloor~, VehicleType) ParkingSpot
    }
    class NearestToGateStrategy
    class LowestFloorFirstStrategy
    SpotAllocationStrategy <|.. NearestToGateStrategy
    SpotAllocationStrategy <|.. LowestFloorFirstStrategy

    class PricingStrategy {
      <<interface>>
      +calculateFee(ParkingTicket) double
    }
    class HourlyPricingStrategy
    class PeakHourPricingStrategy
    PricingStrategy <|.. HourlyPricingStrategy
    PricingStrategy <|.. PeakHourPricingStrategy

    ParkingLot *-- ParkingFloor
    ParkingFloor *-- ParkingSpot
    ParkingLot o-- SpotAllocationStrategy
    ParkingLot o-- PricingStrategy
    ParkingSpot o-- Vehicle`
    },

    designPatterns: [
      {
        pattern: 'Singleton Pattern',
        appliedTo: 'ParkingLot class',
        whyChosen: 'Only one central administrative parking lot instance should manage floors, active tickets, and global configuration in a single JVM.',
        alternatives: 'Dependency Injection container (Spring @Service / Singleton Bean).'
      },
      {
        pattern: 'Strategy Pattern',
        appliedTo: 'SpotAllocationStrategy & PricingStrategy',
        whyChosen: 'Enables switching from Nearest-to-Gate to Lowest-Floor-First allocation without changing the ParkingLot core logic (Open/Closed Principle).',
        alternatives: 'Hardcoded switch-case (violates OCP and difficult to test).'
      },
      {
        pattern: 'Factory Pattern',
        appliedTo: 'VehicleFactory & SpotFactory',
        whyChosen: 'Decouples object instantiation of different vehicle and spot specializations based on input criteria.',
        alternatives: 'Direct constructor calls with `new Car()` scattered across code.'
      },
      {
        pattern: 'Observer Pattern',
        appliedTo: 'DisplayBoard observing ParkingFloor state',
        whyChosen: 'Whenever a spot is occupied or vacated, the DisplayBoard at the gate is automatically notified to update available counts in real time.',
        alternatives: 'Polling every X seconds (wastes CPU and risks stale display).'
      }
    ],

    referenceCode: {
      java: `// Production-Grade Java Implementation of Parking Lot LLD

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

enum VehicleType { BIKE, CAR, TRUCK }
enum SpotType { BIKE_SPOT, COMPACT, LARGE }
enum TicketStatus { ACTIVE, PAID, LOST }

abstract class Vehicle {
    private final String licensePlate;
    private final VehicleType type;

    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }
    public VehicleType getType() { return type; }
    public String getLicensePlate() { return licensePlate; }
}

class Car extends Vehicle { public Car(String plate) { super(plate, VehicleType.CAR); } }
class Bike extends Vehicle { public Bike(String plate) { super(plate, VehicleType.BIKE); } }
class Truck extends Vehicle { public Truck(String plate) { super(plate, VehicleType.TRUCK); } }

abstract class ParkingSpot {
    private final String spotId;
    private final SpotType spotType;
    private boolean isAvailable = true;
    private Vehicle currentVehicle;
    private final ReentrantLock lock = new ReentrantLock();

    public ParkingSpot(String spotId, SpotType spotType) {
        this.spotId = spotId;
        this.spotType = spotType;
    }

    public boolean assignVehicle(Vehicle vehicle) {
        lock.lock();
        try {
            if (!isAvailable) return false;
            this.currentVehicle = vehicle;
            this.isAvailable = false;
            return true;
        } finally {
            lock.unlock();
        }
    }

    public void removeVehicle() {
        lock.lock();
        try {
            this.currentVehicle = null;
            this.isAvailable = true;
        } finally {
            lock.unlock();
        }
    }

    public boolean isAvailable() { return isAvailable; }
    public String getSpotId() { return spotId; }
    public SpotType getSpotType() { return spotType; }
    public Vehicle getCurrentVehicle() { return currentVehicle; }
}

class CompactSpot extends ParkingSpot { public CompactSpot(String id) { super(id, SpotType.COMPACT); } }
class BikeSpot extends ParkingSpot { public BikeSpot(String id) { super(id, SpotType.BIKE_SPOT); } }
class LargeSpot extends ParkingSpot { public LargeSpot(String id) { super(id, SpotType.LARGE); } }

class ParkingTicket {
    private final String ticketId;
    private final Vehicle vehicle;
    private final ParkingSpot spot;
    private final LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private TicketStatus status;

    public ParkingTicket(Vehicle vehicle, ParkingSpot spot) {
        this.ticketId = UUID.randomUUID().toString().substring(0, 8);
        this.vehicle = vehicle;
        this.spot = spot;
        this.entryTime = LocalDateTime.now();
        this.status = TicketStatus.ACTIVE;
    }

    public void closeTicket(LocalDateTime exitTime) {
        this.exitTime = exitTime;
        this.status = TicketStatus.PAID;
    }

    public String getTicketId() { return ticketId; }
    public LocalDateTime getEntryTime() { return entryTime; }
    public LocalDateTime getExitTime() { return exitTime; }
    public ParkingSpot getSpot() { return spot; }
    public Vehicle getVehicle() { return vehicle; }
}

interface SpotAllocationStrategy {
    ParkingSpot findSpot(List<ParkingFloor> floors, Vehicle vehicle);
}

class NearestToEntryStrategy implements SpotAllocationStrategy {
    @Override
    public ParkingSpot findSpot(List<ParkingFloor> floors, Vehicle vehicle) {
        SpotType requiredType = mapVehicleToSpotType(vehicle.getType());
        for (ParkingFloor floor : floors) {
            Optional<ParkingSpot> spot = floor.getAvailableSpot(requiredType);
            if (spot.isPresent()) return spot.get();
        }
        return null;
    }

    private SpotType mapVehicleToSpotType(VehicleType type) {
        switch (type) {
            case BIKE: return SpotType.BIKE_SPOT;
            case CAR: return SpotType.COMPACT;
            case TRUCK: return SpotType.LARGE;
            default: throw new IllegalArgumentException("Unknown type: " + type);
        }
    }
}

interface PricingStrategy {
    double calculateFee(ParkingTicket ticket);
}

class HourlyPricingStrategy implements PricingStrategy {
    private final Map<VehicleType, Double> hourlyRates = Map.of(
        VehicleType.BIKE, 15.0,
        VehicleType.CAR, 30.0,
        VehicleType.TRUCK, 60.0
    );

    @Override
    public double calculateFee(ParkingTicket ticket) {
        LocalDateTime exit = ticket.getExitTime() != null ? ticket.getExitTime() : LocalDateTime.now();
        long minutes = Math.max(1, Duration.between(ticket.getEntryTime(), exit).toMinutes());
        long hours = (long) Math.ceil(minutes / 60.0);
        return hours * hourlyRates.getOrDefault(ticket.getVehicle().getType(), 20.0);
    }
}

class ParkingFloor {
    private final int floorNumber;
    private final List<ParkingSpot> spots = new ArrayList<>();

    public ParkingFloor(int floorNumber) { this.floorNumber = floorNumber; }

    public void addSpot(ParkingSpot spot) { spots.add(spot); }

    public Optional<ParkingSpot> getAvailableSpot(SpotType type) {
        return spots.stream()
            .filter(s -> s.getSpotType() == type && s.isAvailable())
            .findFirst();
    }

    public int getFloorNumber() { return floorNumber; }
    public List<ParkingSpot> getSpots() { return Collections.unmodifiableList(spots); }
}

class ParkingLot {
    private static volatile ParkingLot instance;
    private final List<ParkingFloor> floors = new ArrayList<>();
    private final Map<String, ParkingTicket> activeTickets = new ConcurrentHashMap<>();
    private SpotAllocationStrategy allocationStrategy;
    private PricingStrategy pricingStrategy;

    private ParkingLot() {
        this.allocationStrategy = new NearestToEntryStrategy();
        this.pricingStrategy = new HourlyPricingStrategy();
    }

    public static ParkingLot getInstance() {
        if (instance == null) {
            synchronized (ParkingLot.class) {
                if (instance == null) instance = new ParkingLot();
            }
        }
        return instance;
    }

    public void addFloor(ParkingFloor floor) { floors.add(floor); }

    public synchronized ParkingTicket parkVehicle(Vehicle vehicle) {
        ParkingSpot spot = allocationStrategy.findSpot(floors, vehicle);
        if (spot == null) {
            throw new IllegalStateException("Parking full for vehicle type: " + vehicle.getType());
        }
        if (spot.assignVehicle(vehicle)) {
            ParkingTicket ticket = new ParkingTicket(vehicle, spot);
            activeTickets.put(ticket.getTicketId(), ticket);
            return ticket;
        }
        throw new IllegalStateException("Failed to acquire spot concurrently");
    }

    public double unparkVehicle(String ticketId) {
        ParkingTicket ticket = activeTickets.remove(ticketId);
        if (ticket == null) throw new IllegalArgumentException("Invalid ticket ID: " + ticketId);

        ticket.closeTicket(LocalDateTime.now());
        ticket.getSpot().removeVehicle();
        return pricingStrategy.calculateFee(ticket);
    }
}`,
      python: `# Pythonic implementation of Parking Lot LLD
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from enum import Enum
import threading

class VehicleType(Enum):
    BIKE = 'BIKE'
    CAR = 'CAR'
    TRUCK = 'TRUCK'

class SpotType(Enum):
    BIKE_SPOT = 'BIKE_SPOT'
    COMPACT = 'COMPACT'
    LARGE = 'LARGE'

class Vehicle(ABC):
    def __init__(self, license_plate: str, vehicle_type: VehicleType):
        self.license_plate = license_plate
        self.vehicle_type = vehicle_type

class Car(Vehicle):
    def __init__(self, plate: str):
        super().__init__(plate, VehicleType.CAR)

class Bike(Vehicle):
    def __init__(self, plate: str):
        super().__init__(plate, VehicleType.BIKE)

class ParkingSpot(ABC):
    def __init__(self, spot_id: str, spot_type: SpotType):
        self.spot_id = spot_id
        self.spot_type = spot_type
        self.is_available = True
        self.current_vehicle = None
        self._lock = threading.Lock()

    def assign_vehicle(self, vehicle: Vehicle) -> bool:
        with self._lock:
            if not self.is_available:
                return False
            self.current_vehicle = vehicle
            self.is_available = False
            return True

    def remove_vehicle(self):
        with self._lock:
            self.current_vehicle = None
            self.is_available = True

class ParkingTicket:
    def __init__(self, vehicle: Vehicle, spot: ParkingSpot):
        self.ticket_id = str(uuid.uuid4())[:8]
        self.vehicle = vehicle
        self.spot = spot
        self.entry_time = datetime.now()
        self.exit_time = None

    def close(self):
        self.exit_time = datetime.now()

class PricingStrategy(ABC):
    @abstractmethod
    def calculate_fee(self, ticket: ParkingTicket) -> float:
        pass

class HourlyPricingStrategy(PricingStrategy):
    RATES = {VehicleType.BIKE: 15.0, VehicleType.CAR: 30.0, VehicleType.TRUCK: 60.0}

    def calculate_fee(self, ticket: ParkingTicket) -> float:
        duration_hours = max(1.0, (ticket.exit_time - ticket.entry_time).total_seconds() / 3600.0)
        rate = self.RATES.get(ticket.vehicle.vehicle_type, 20.0)
        return round(duration_hours * rate, 2)

class ParkingLot:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ParkingLot, cls).__new__(cls)
                cls._instance.floors = []
                cls._instance.active_tickets = {}
                cls._instance.pricing_strategy = HourlyPricingStrategy()
            return cls._instance

    def park(self, vehicle: Vehicle) -> ParkingTicket:
        # Search available spot across floors
        for floor in self.floors:
            for spot in floor.spots:
                if spot.is_available and spot.assign_vehicle(vehicle):
                    ticket = ParkingTicket(vehicle, spot)
                    self.active_tickets[ticket.ticket_id] = ticket
                    return ticket
        raise Exception("Parking is full")

    def unpark(self, ticket_id: str) -> float:
        ticket = self.active_tickets.pop(ticket_id, None)
        if not ticket:
            raise ValueError("Ticket not found")
        ticket.close()
        ticket.spot.remove_vehicle()
        return self.pricing_strategy.calculate_fee(ticket)`
    },

    simulatorType: 'parking-lot'
  },

  {
    id: 'splitwise',
    dayIndex: 2,
    title: 'Design an Expense Sharing System (Splitwise)',
    difficulty: 'Hard',
    company: 'Atlassian / Microsoft / Uber / Flipkart',
    estimatedTime: '50 mins',
    category: 'System Architecture & Graph Simplification',
    tags: ['Graph Algorithm', 'Strategy Pattern', 'Factory Pattern', 'Transaction Safety', 'Observer Pattern'],
    summary: 'Design an expense-sharing application where friends create groups, record split expenses (Equal, Exact amounts, Percentages), track balances, and compute minimum transaction settlement graphs.',
    realWorldContext: 'Roommates or travel buddies spend shared money on meals, cabs, and hotels. Calculating who owes whom with circular debts (A owes B, B owes C, C owes A) leads to confusion unless a simplified debt graph is computed.',
    
    requirements: {
      functional: [
        'Add users with user ID, name, email, and phone number.',
        'Create groups and add/remove members.',
        'Add expenses paid by one or multiple users, split across participants.',
        'Support multiple split types: EQUAL, EXACT amounts, and PERCENTAGE.',
        'View individual user balance sheet: total balance, who they owe, and who owes them.',
        'Simplify Debt Algorithm: minimize the total number of transactions required to settle all debts in a group.',
        'Settle balances between two users directly.'
      ],
      nonFunctional: [
        'Precision & Idempotency: Financial values must avoid IEEE 754 floating point rounding errors (use BigDecimal / cents).',
        'Validation: Total split shares must sum exactly to 100% (for percentage) or the exact total amount (for exact).',
        'High Concurrency: Two roommates recording expenses simultaneously must not corrupt group balances.'
      ],
      outOfScope: [
        'Payment gateway integration (Stripe, UPI) — assume off-app settlement confirmation.',
        'Multi-currency automatic Forex conversion.'
      ],
      clarifyingQuestions: [
        {
          q: 'What algorithm simplifies the debts to minimum transactions?',
          a: 'Calculate net balances for all users (credits - debits). Separate users into Creditors (net > 0) and Debtors (net < 0). Greedily settle maximum debtor with maximum creditor using Min-Cash-Flow algorithm or Two Pointers.',
          hint: 'Net balance calculation reduces an N-node complete directed graph to at most N-1 transactions.'
        },
        {
          q: 'How should we represent split types to maintain Open/Closed Principle?',
          a: 'Use Strategy Pattern: define `ExpenseSplitStrategy` with `validateSplit()` and `calculateShares()`. New split types like SHARE_RATIO can be added without modifying ExpenseManager.',
          hint: 'Concrete classes: `EqualSplitStrategy`, `ExactSplitStrategy`, `PercentageSplitStrategy`.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'User / Payer', role: 'Creates expense, pays for shares, and settles pending balances' },
        { name: 'Group Admin', role: 'Creates group and manages participant roster' }
      ],
      coreEntities: [
        {
          name: 'User',
          description: 'Entity representing an individual user in the system.',
          attributes: ['userId: string', 'name: string', 'email: string', 'balanceSheet: UserBalanceSheet'],
          methods: ['getTotalBalance(): double', 'getBalanceWith(User other): double'],
          relationships: ['Belongs to multiple Groups and participates in Expenses.']
        },
        {
          name: 'Expense (Abstract)',
          description: 'Represents a single bill with amount, paidBy user, and participant splits.',
          attributes: ['expenseId: string', 'description: string', 'totalAmount: double', 'paidBy: User', 'splits: List<Split>', 'splitType: SplitType'],
          methods: ['validate(): boolean'],
          relationships: ['Contains multiple Split objects. Belongs to a Group or 1:1.']
        },
        {
          name: 'Split (Abstract)',
          description: 'Represents an individual user’s share in an expense.',
          attributes: ['user: User', 'amountOwed: double'],
          methods: ['getAmount(): double', 'setAmount(double a): void'],
          relationships: ['Extended by EqualSplit, ExactSplit, PercentSplit.']
        },
        {
          name: 'DebtSimplifier',
          description: 'Service implementing the graph minimum cash flow settlement algorithm.',
          attributes: ['group: Group'],
          methods: ['simplifyDebts(Map<String, Map<String, Double>> balances): List<Transaction>'],
          relationships: ['Used by ExpenseManager.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction TB
    class User {
      -string userId
      -string name
      -Map~string, double~ balanceSheet
      +updateBalance(User, double)
    }
    class Expense {
      <<abstract>>
      -string expenseId
      -double amount
      -User paidBy
      -List~Split~ splits
      +validate() boolean
    }
    class Split {
      <<abstract>>
      -User user
      -double amount
    }
    class EqualSplit
    class ExactSplit
    class PercentSplit
    Split <|-- EqualSplit
    Split <|-- ExactSplit
    Split <|-- PercentSplit

    class SplitStrategy {
      <<interface>>
      +validate(List~Split~, double) boolean
      +calculate(List~Split~, double)
    }
    class EqualSplitStrategy
    class ExactSplitStrategy
    class PercentSplitStrategy
    SplitStrategy <|.. EqualSplitStrategy
    SplitStrategy <|.. ExactSplitStrategy
    SplitStrategy <|.. PercentSplitStrategy

    class DebtSimplifier {
      +simplify(Map~User, double~ netBalances) List~Transaction~
    }

    Expense *-- Split
    Expense o-- SplitStrategy
    Expense o-- User`
    },

    designPatterns: [
      {
        pattern: 'Strategy Pattern',
        appliedTo: 'ExpenseSplitStrategy',
        whyChosen: 'Enables switching between Equal, Percentage, and Exact split validation and computation without altering the Expense processing pipeline.',
        alternatives: 'Nested if-else conditionals in createExpense method.'
      },
      {
        pattern: 'Factory Pattern',
        appliedTo: 'ExpenseFactory / SplitFactory',
        whyChosen: 'Instantiates the correct Split subclasses and strategies based on SplitType enum.',
        alternatives: 'Client instantiating concrete subclasses manually.'
      },
      {
        pattern: 'Observer Pattern',
        appliedTo: 'Notification on Expense Added',
        whyChosen: 'Notify all participants when a new expense is logged or settlement occurs.',
        alternatives: 'Direct procedural email/push calls tied into calculation logic.'
      }
    ],

    referenceCode: {
      java: `// Production Splitwise LLD in Java
import java.util.*;

enum SplitType { EQUAL, EXACT, PERCENTAGE }

class User {
    private final String id;
    private final String name;
    public User(String id, String name) { this.id = id; this.name = name; }
    public String getId() { return id; }
    public String getName() { return name; }
}

abstract class Split {
    private final User user;
    protected double amount;

    public Split(User user) { this.user = user; }
    public User getUser() { return user; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}

class EqualSplit extends Split { public EqualSplit(User user) { super(user); } }
class ExactSplit extends Split {
    public ExactSplit(User user, double amount) { super(user); this.amount = amount; }
}
class PercentSplit extends Split {
    private final double percent;
    public PercentSplit(User user, double percent) { super(user); this.percent = percent; }
    public double getPercent() { return percent; }
}

// Debt Simplification using Min Cash Flow Algorithm
class DebtSimplifier {
    public static class Transaction {
        public String debtor;
        public String creditor;
        public double amount;
        public Transaction(String d, String c, double a) { debtor = d; creditor = c; amount = a; }
    }

    public static List<Transaction> simplifyDebts(Map<String, Double> netBalance) {
        List<Transaction> transactions = new ArrayList<>();
        PriorityQueue<Map.Entry<String, Double>> debtors = new PriorityQueue<>(Comparator.comparingDouble(Map.Entry::getValue));
        PriorityQueue<Map.Entry<String, Double>> creditors = new PriorityQueue<>((a, b) -> Double.compare(b.getValue(), a.getValue()));

        for (Map.Entry<String, Double> entry : netBalance.entrySet()) {
            if (entry.getValue() < -0.001) debtors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            else if (entry.getValue() > 0.001) creditors.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
        }

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            var debtor = debtors.poll();
            var creditor = creditors.poll();

            double settleAmount = Math.min(-debtor.getValue(), creditor.getValue());
            transactions.add(new Transaction(debtor.getKey(), creditor.getKey(), settleAmount));

            double remainingDebt = debtor.getValue() + settleAmount;
            double remainingCredit = creditor.getValue() - settleAmount;

            if (remainingDebt < -0.001) debtors.add(new AbstractMap.SimpleEntry<>(debtor.getKey(), remainingDebt));
            if (remainingCredit > 0.001) creditors.add(new AbstractMap.SimpleEntry<>(creditor.getKey(), remainingCredit));
        }
        return transactions;
    }
}`,
      python: `# Splitwise simplified debt algorithm
from collections import defaultdict
import heapq

def simplify_debts(balances):
    # balances: dict of user -> net amount (positive = owes money, negative = owed money)
    debtors = [] # max heap (as negative)
    creditors = [] # max heap

    for user, net in balances.items():
        if net < -0.01:
            heapq.heappush(debtors, (net, user))
        elif net > 0.01:
            heapq.heappush(creditors, (-net, user))

    transactions = []
    while debtors and creditors:
        debt_amount, debtor = heapq.heappop(debtors)
        credit_amount, creditor = heapq.heappop(creditors)
        credit_amount = -credit_amount

        settled = min(-debt_amount, credit_amount)
        transactions.append({'from': debtor, 'to': creditor, 'amount': round(settled, 2)})

        rem_debt = debt_amount + settled
        rem_credit = credit_amount - settled

        if rem_debt < -0.01:
            heapq.heappush(debtors, (rem_debt, debtor))
        if rem_credit > 0.01:
            heapq.heappush(creditors, (-rem_credit, creditor))

    return transactions`
    },

    simulatorType: 'splitwise'
  },

  {
    id: 'elevator-system',
    dayIndex: 3,
    title: 'Design a Multi-Elevator Controller System',
    difficulty: 'Medium',
    company: 'Google / Goldman Sachs / Adobe',
    estimatedTime: '40 mins',
    category: 'State Pattern & Dispatch Algorithms',
    tags: ['State Pattern', 'Strategy Pattern', 'Concurrency', 'Scheduling Algorithm'],
    summary: 'Design a smart multi-car elevator control system for a 20-story building with internal floor requests, external hall calls, SCAN/LOOK scheduling, and state-machine transitions.',
    realWorldContext: 'Skyscrapers waste millions of hours if elevator dispatching is naive. Modern buildings run group dispatch controllers optimizing passenger wait times, energy efficiency, and preventing elevator starvation during morning rushes.',
    
    requirements: {
      functional: [
        'Support multiple elevator cars operating in parallel across N floors.',
        'Support Hall Calls (Outside buttons: Up / Down) on each floor.',
        'Support Car Calls (Inside cabin: Destination floor buttons).',
        'State transitions: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, EMERGENCY.',
        'Dispatching algorithm: Assign incoming hall calls to the best elevator car to minimize passenger wait time (SCAN / LOOK / Nearest Car).',
        'Door safety sensor: Do not close doors if passenger obstacle detected.'
      ],
      nonFunctional: [
        'Starvation Prevention: Every requested floor must eventually be serviced.',
        'Concurrency: Simultaneous button presses from multiple passengers inside and outside.',
        'Thread safety for state machine transitions.'
      ],
      outOfScope: [
        'Physical motor voltage and weight sensor calibration.'
      ],
      clarifyingQuestions: [
        {
          q: 'Which dispatching algorithm is best for elevators?',
          a: 'The SCAN (Elevator Algorithm) or LOOK algorithm. The car continues in its current direction servicing all requests until no further requests exist in that direction, then reverses.',
          hint: 'Keep two priority queues or TreeSet per car: `upStops` (min-heap) and `downStops` (max-heap).'
        },
        {
          q: 'How should elevator states be modeled?',
          a: 'Use the State Pattern: Define an `ElevatorState` interface with operations like `pressFloor()`, `step()`, `openDoor()`, `closeDoor()`.',
          hint: 'Prevents massive switch-case statements with messy boolean flags.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'Passenger', role: 'Calls elevator from floor hall or presses destination button inside cabin' },
        { name: 'Building Admin', role: 'Puts elevator into maintenance or emergency mode' }
      ],
      coreEntities: [
        {
          name: 'ElevatorCar',
          description: 'Physical elevator with current floor, direction, state, and destination queue.',
          attributes: ['id: int', 'currentFloor: int', 'direction: Direction', 'state: ElevatorState', 'upStops: TreeSet<Integer>', 'downStops: TreeSet<Integer>'],
          methods: ['addDestination(int floor)', 'move()', 'openDoor()', 'closeDoor()'],
          relationships: ['Maintained by ElevatorController.']
        },
        {
          name: 'ElevatorController',
          description: 'Group controller assigning incoming hall requests to the optimal car.',
          attributes: ['cars: List<ElevatorCar>', 'dispatchStrategy: DispatchStrategy'],
          methods: ['requestElevator(int floor, Direction direction)', 'stepAll()'],
          relationships: ['Orchestrates multiple ElevatorCar instances.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction TB
    class ElevatorController {
      -List~ElevatorCar~ cars
      -DispatchStrategy dispatchStrategy
      +handleHallCall(int floor, Direction dir)
      +step()
    }
    class ElevatorCar {
      -int id
      -int currentFloor
      -Direction direction
      -ElevatorState state
      -TreeSet~int~ upRequests
      -TreeSet~int~ downRequests
      +addStop(int floor)
      +move()
    }
    class ElevatorState {
      <<interface>>
      +move(ElevatorCar)
      +openDoor(ElevatorCar)
      +closeDoor(ElevatorCar)
    }
    class IdleState
    class MovingUpState
    class MovingDownState
    class DoorOpenState
    ElevatorState <|.. IdleState
    ElevatorState <|.. MovingUpState
    ElevatorState <|.. MovingDownState
    ElevatorState <|.. DoorOpenState

    class DispatchStrategy {
      <<interface>>
      +selectBestCar(List~ElevatorCar~, int floor, Direction dir) ElevatorCar
    }

    ElevatorController *-- ElevatorCar
    ElevatorCar o-- ElevatorState
    ElevatorController o-- DispatchStrategy`
    },

    designPatterns: [
      {
        pattern: 'State Pattern',
        appliedTo: 'ElevatorState (Idle, MovingUp, MovingDown, DoorOpen)',
        whyChosen: 'Cleanly encapsulates behavior that changes depending on the elevator’s current state without messy nested if/else flags.',
        alternatives: 'Enumeration with large switch blocks.'
      },
      {
        pattern: 'Strategy Pattern',
        appliedTo: 'DispatchStrategy (SCAN vs Nearest Car)',
        whyChosen: 'Allows building management to swap scheduling algorithms depending on traffic patterns (e.g. Morning Rush vs Lunchtime peak).',
        alternatives: 'Hardcoded dispatch logic inside controller.'
      }
    ],

    referenceCode: {
      java: `// Production Elevator State & Controller
import java.util.*;

enum Direction { UP, DOWN, IDLE }

class ElevatorCar {
    private final int id;
    private int currentFloor = 1;
    private Direction direction = Direction.IDLE;
    private final TreeSet<Integer> upStops = new TreeSet<>();
    private final TreeSet<Integer> downStops = new TreeSet<>((a, b) -> b - a);

    public ElevatorCar(int id) { this.id = id; }

    public synchronized void addStop(int floor) {
        if (floor > currentFloor) upStops.add(floor);
        else if (floor < currentFloor) downStops.add(floor);
        if (direction == Direction.IDLE) {
            direction = (floor >= currentFloor) ? Direction.UP : Direction.DOWN;
        }
    }

    public synchronized void step() {
        if (direction == Direction.UP) {
            if (!upStops.isEmpty()) {
                currentFloor++;
                if (upStops.contains(currentFloor)) {
                    upStops.remove(currentFloor);
                    System.out.println("Elevator " + id + " reached floor " + currentFloor + ". Door opening.");
                }
                if (upStops.isEmpty()) direction = downStops.isEmpty() ? Direction.IDLE : Direction.DOWN;
            }
        } else if (direction == Direction.DOWN) {
            if (!downStops.isEmpty()) {
                currentFloor--;
                if (downStops.contains(currentFloor)) {
                    downStops.remove(currentFloor);
                    System.out.println("Elevator " + id + " reached floor " + currentFloor + ". Door opening.");
                }
                if (downStops.isEmpty()) direction = upStops.isEmpty() ? Direction.IDLE : Direction.UP;
            }
        }
    }

    public int getCurrentFloor() { return currentFloor; }
    public Direction getDirection() { return direction; }
    public int getId() { return id; }
}`,
      python: `# Python Elevator Controller
class ElevatorCar:
    def __init__(self, car_id: int):
        self.car_id = car_id
        self.current_floor = 1
        self.direction = 'IDLE' # 'UP', 'DOWN', 'IDLE'
        self.destinations = set()

    def add_destination(self, floor: int):
        self.destinations.add(floor)
        if self.direction == 'IDLE':
            self.direction = 'UP' if floor > self.current_floor else 'DOWN'

    def step(self):
        if not self.destinations:
            self.direction = 'IDLE'
            return

        if self.direction == 'UP':
            self.current_floor += 1
        elif self.direction == 'DOWN':
            self.current_floor -= 1

        if self.current_floor in self.destinations:
            self.destinations.remove(self.current_floor)
            # Re-evaluate direction
            if not self.destinations:
                self.direction = 'IDLE'`
    },

    simulatorType: 'elevator'
  },

  {
    id: 'rate-limiter',
    dayIndex: 4,
    title: 'Design an API Rate Limiter (Token Bucket / Sliding Window)',
    difficulty: 'Medium',
    company: 'Stripe / Cloudflare / Meta / Netflix',
    estimatedTime: '40 mins',
    category: 'System Concurrency & Algorithms',
    tags: ['Token Bucket', 'Sliding Window', 'Strategy Pattern', 'Concurrency', 'Thread Safety'],
    summary: 'Design an extensible in-memory API Rate Limiter that throttles client requests according to custom limits (e.g. 5 requests / sec, tiered by API tier). Support Token Bucket, Leaky Bucket, and Sliding Window Counter.',
    realWorldContext: 'Public APIs at Stripe or GitHub protect their backend infrastructure from DDoS, brute-force attacks, and abusive crawlers by returning HTTP 429 Too Many Requests when customer quota is exhausted.',
    
    requirements: {
      functional: [
        'Throttle API requests based on client identifier (IP address, User ID, or API Key).',
        'Support multiple rate limiting algorithms: Token Bucket, Leaky Bucket, and Sliding Window Counter.',
        'Support configurable rules per tier (e.g., Free: 10 req/min, Premium: 100 req/min).',
        'Return headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset-After`.'
      ],
      nonFunctional: [
        'Extremely low latency: Decision must be computed in < 2ms.',
        'High Concurrency: Hundreds of concurrent requests per client must not exceed limit (Atomic operations).',
        'Memory efficiency: Evict expired client buckets periodically.'
      ],
      outOfScope: [
        'Distributed Redis cluster networking (focus on thread-safe LLD structure).'
      ],
      clarifyingQuestions: [
        {
          q: 'Why is Token Bucket preferred over Fixed Window Counter?',
          a: 'Fixed Window suffers from boundary burst issues: double the limit can pass at the window boundary (e.g. 10 at 00:59 and 10 at 01:00). Token Bucket allows smooth refill and configurable burst capacity.',
          hint: 'Token Bucket refills tokens based on elapsed time: `tokens += (now - lastRefill) * refillRate`.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'API Client', role: 'Sends HTTP requests with API key or IP' },
        { name: 'API Gateway Filter', role: 'Intercepts requests and queries RateLimiter before forwarding' }
      ],
      coreEntities: [
        {
          name: 'TokenBucket',
          description: 'Holds tokens for a single client with atomic refill and consumption.',
          attributes: ['capacity: long', 'tokens: double', 'refillRatePerSec: double', 'lastRefillTimestamp: long'],
          methods: ['tryConsume(long tokensRequested): boolean', 'refill(): void'],
          relationships: ['Managed by RateLimiterService.']
        },
        {
          name: 'RateLimiter (Interface)',
          description: 'Strategy interface for rate limiting implementations.',
          attributes: ['rule: RateLimitRule'],
          methods: ['allowRequest(String clientId): boolean'],
          relationships: ['Implemented by TokenBucketRateLimiter, SlidingWindowRateLimiter.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction TB
    class RateLimiter {
      <<interface>>
      +allowRequest(String clientId) boolean
    }
    class TokenBucketRateLimiter {
      -Map~String, TokenBucket~ buckets
      -long capacity
      -double refillRate
      +allowRequest(String clientId) boolean
    }
    class SlidingWindowRateLimiter {
      -Map~String, Queue~Long~~ requestTimestamps
      -int windowSizeSec
      -int maxRequests
      +allowRequest(String clientId) boolean
    }
    RateLimiter <|.. TokenBucketRateLimiter
    RateLimiter <|.. SlidingWindowRateLimiter

    class TokenBucket {
      -long capacity
      -double tokens
      -double refillRate
      -long lastRefillTime
      +tryConsume() boolean
      -refill()
    }
    TokenBucketRateLimiter *-- TokenBucket`
    },

    designPatterns: [
      {
        pattern: 'Strategy Pattern',
        appliedTo: 'RateLimiter (TokenBucket vs SlidingWindow)',
        whyChosen: 'Allows switching between algorithms depending on whether smooth rate or exact window accuracy is needed.',
        alternatives: 'Hardcoded if/else inside gateway.'
      }
    ],

    referenceCode: {
      java: `// Production Thread-Safe Token Bucket Rate Limiter
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

class TokenBucket {
    private final long capacity;
    private final double refillRatePerSecond;
    private double availableTokens;
    private long lastRefillTimeMs;

    public TokenBucket(long capacity, double refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRatePerSecond;
        this.availableTokens = capacity;
        this.lastRefillTimeMs = System.currentTimeMillis();
    }

    public synchronized boolean tryConsume(int tokensRequested) {
        refill();
        if (availableTokens >= tokensRequested) {
            availableTokens -= tokensRequested;
            return true;
        }
        return false;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        double elapsedSeconds = (now - lastRefillTimeMs) / 1000.0;
        double tokensToAdd = elapsedSeconds * refillRatePerSecond;
        availableTokens = Math.min(capacity, availableTokens + tokensToAdd);
        lastRefillTimeMs = now;
    }

    public synchronized double getAvailableTokens() {
        refill();
        return availableTokens;
    }
}`,
      python: `# Python Token Bucket
import time
import threading

class TokenBucket:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.tokens = capacity
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def allow_request(self) -> bool:
        with self.lock:
            now = time.time()
            elapsed = now - self.last_refill
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
            self.last_refill = now

            if self.tokens >= 1.0:
                self.tokens -= 1.0
                return True
            return False`
    },

    simulatorType: 'rate-limiter'
  },

  {
    id: 'lru-cache',
    dayIndex: 5,
    title: 'Design an In-Memory Key-Value Store with LRU Cache',
    difficulty: 'Easy',
    company: 'Amazon / Microsoft / Apple / Salesforce',
    estimatedTime: '35 mins',
    category: 'Data Structures & Concurrency',
    tags: ['LRU Cache', 'Doubly Linked List', 'HashMap', 'O(1) Access', 'Thread Safety'],
    summary: 'Design an in-memory key-value cache with bounded capacity that evicts the Least Recently Used (LRU) element in O(1) time complexity for both get() and put() operations.',
    realWorldContext: 'Redis and Memcached buffer database reads in memory. When RAM fills up, the cache must evict entries that have not been read recently to free space for hot items.',
    
    requirements: {
      functional: [
        '`get(key)`: Return value if present and mark as recently used; else return -1/null.',
        '`put(key, value)`: Insert or update key-value. If capacity exceeded, evict the least recently used key.',
        'Both operations must run in strict O(1) average time complexity.'
      ],
      nonFunctional: [
        'Thread safety for concurrent reads and writes.',
        'Extensibility: Support different eviction strategies (LRU, LFU, FIFO).'
      ],
      outOfScope: ['Disk persistence or cluster replication.'],
      clarifyingQuestions: [
        {
          q: 'Why combine a Doubly Linked List with a HashMap?',
          a: 'HashMap gives O(1) key lookup. Doubly Linked List allows O(1) node removal and insertion at the head without shifting array elements.',
          hint: 'Use dummy head and dummy tail nodes to eliminate edge case null checks.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'Application Service', role: 'Calls cache get() and put() to accelerate DB access' }
      ],
      coreEntities: [
        {
          name: 'Node<K, V>',
          description: 'Doubly linked list element containing key, value, prev, and next pointers.',
          attributes: ['key: K', 'value: V', 'prev: Node', 'next: Node'],
          methods: [],
          relationships: ['Contained in DoublyLinkedList and referenced by HashMap.']
        },
        {
          name: 'LRUCache<K, V>',
          description: 'Orchestrates HashMap + DoublyLinkedList with capacity limit.',
          attributes: ['capacity: int', 'map: Map<K, Node<K,V>>', 'head: Node', 'tail: Node'],
          methods: ['get(K key): V', 'put(K key, V value): void'],
          relationships: ['Provides O(1) cache access.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction LR
    class LRUCache {
      -int capacity
      -Map~K, Node~ map
      -Node head
      -Node tail
      +get(K key) V
      +put(K key, V val)
      -moveToHead(Node)
      -removeTail() Node
    }
    class Node {
      +K key
      +V value
      +Node prev
      +Node next
    }
    LRUCache *-- Node`
    },

    designPatterns: [
      {
        pattern: 'Composite / Bridge of Data Structures',
        appliedTo: 'HashMap + DoublyLinkedList',
        whyChosen: 'Combines O(1) random key lookup with O(1) ordered insertion and deletion.',
        alternatives: 'LinkedHashMap in Java standard library.'
      }
    ],

    referenceCode: {
      java: `// Production LRU Cache with Dummy Head/Tail
import java.util.*;

public class LRUCache<K, V> {
    private static class Node<K, V> {
        K key;
        V value;
        Node<K, V> prev, next;
        Node(K k, V v) { key = k; value = v; }
    }

    private final int capacity;
    private final Map<K, Node<K, V>> map = new HashMap<>();
    private final Node<K, V> head = new Node<>(null, null);
    private final Node<K, V> tail = new Node<>(null, null);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public synchronized V get(K key) {
        Node<K, V> node = map.get(key);
        if (node == null) return null;
        moveToHead(node);
        return node.value;
    }

    public synchronized void put(K key, V value) {
        Node<K, V> node = map.get(key);
        if (node != null) {
            node.value = value;
            moveToHead(node);
        } else {
            if (map.size() >= capacity) {
                Node<K, V> lru = removeTail();
                map.remove(lru.key);
            }
            Node<K, V> newNode = new Node<>(key, value);
            map.put(key, newNode);
            addToHead(newNode);
        }
    }

    private void addToHead(Node<K, V> node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }

    private void removeNode(Node<K, V> node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void moveToHead(Node<K, V> node) {
        removeNode(node);
        addToHead(node);
    }

    private Node<K, V> removeTail() {
        Node<K, V> res = tail.prev;
        removeNode(res);
        return res;
    }
}`,
      python: `# Python O(1) LRU Cache
class Node:
    def __init__(self, key=None, val=None):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._move_to_head(node)
        return node.val

    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.val = value
            self._move_to_head(node)
        else:
            if len(self.cache) >= self.capacity:
                lru = self._pop_tail()
                del self.cache[lru.key]
            new_node = Node(key, value)
            self.cache[key] = new_node
            self._add_to_head(new_node)

    def _add_to_head(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def _remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_head(self, node):
        self._remove_node(node)
        self._add_to_head(node)

    def _pop_tail(self):
        res = self.tail.prev
        self._remove_node(res)
        return res`
    },

    simulatorType: 'lru-cache'
  },

  {
    id: 'bookmyshow',
    dayIndex: 6,
    title: 'Design Movie Ticket Booking System (BookMyShow)',
    difficulty: 'Hard',
    company: 'BookMyShow / TicketMaster / Flipkart / Amazon',
    estimatedTime: '50 mins',
    category: 'System Concurrency & Locks',
    tags: ['Optimistic Locking', 'Seat Reservation', 'State Pattern', 'TTL Timer', 'Concurrency'],
    summary: 'Design a concurrent movie ticket booking system with movie schedules, multiplex cinema halls, seat tier categorization (Silver, Gold, VIP), temporary seat locks (10 min TTL), and race-free concurrent reservations.',
    realWorldContext: 'When a blockbuster movie ticket opens, tens of thousands of users attempt to click the exact same seat simultaneously. The system must lock the seat for 10 minutes during payment without double-booking.',
    
    requirements: {
      functional: [
        'List cities, cinemas, movie shows, and hall seat layouts.',
        'View real-time seat availability categorized by Silver, Gold, VIP.',
        'Select and lock seats for 10 minutes while customer completes payment.',
        'If payment succeeds within 10 minutes, confirm booking and issue ticket.',
        'If payment fails or timer expires, automatically release locked seats back to AVAILABLE.'
      ],
      nonFunctional: [
        'Zero double booking: Strict concurrency control on seat reservation.',
        'High availability during peak traffic flash sales.'
      ],
      outOfScope: ['Payment gateway webhook retry network logic.'],
      clarifyingQuestions: [
        {
          q: 'How to implement temporary 10-minute seat locking?',
          a: 'Seat has state: AVAILABLE, TEMPORARILY_LOCKED, BOOKED. In Redis or in-memory, set a key with TTL of 600s: `SET seat:{showId}:{seatId} {userId} NX EX 600`.',
          hint: 'Use optimistic locking with version or atomic check-and-set.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'Customer', role: 'Browses shows, locks seats, pays for tickets' },
        { name: 'Multiplex Manager', role: 'Configures movie schedules and ticket prices' }
      ],
      coreEntities: [
        {
          name: 'Show',
          description: 'A screening of a Movie in a Cinema Hall at a specific DateTime.',
          attributes: ['showId: string', 'movie: Movie', 'cinemaHall: CinemaHall', 'startTime: DateTime', 'seatStatusMap: Map<String, SeatStatus>'],
          methods: ['lockSeats(List<Seat> seats, User user)', 'confirmBooking()'],
          relationships: ['Belongs to Cinema. Contains ShowSeats.']
        },
        {
          name: 'Booking',
          description: 'Record of booked seats, user, payment status, and QR ticket code.',
          attributes: ['bookingId: string', 'user: User', 'show: Show', 'seats: List<Seat>', 'status: BookingStatus'],
          methods: ['markPaid()', 'cancel()'],
          relationships: ['References User, Show, and Seats.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction TB
    class Cinema {
      -string id
      -string name
      -List~Hall~ halls
    }
    class Hall {
      -string id
      -List~Seat~ seats
    }
    class Show {
      -string id
      -Movie movie
      -DateTime startTime
      -Map~string, SeatLock~ activeLocks
      +tryLockSeats(List~string~ seatIds, User) boolean
      +confirmBooking(string bookingId)
    }
    class SeatLock {
      -User user
      -DateTime lockedAt
      -long ttlSeconds
      +isExpired() boolean
    }
    Show *-- SeatLock`
    },

    designPatterns: [
      {
        pattern: 'State Pattern',
        appliedTo: 'SeatStatus (Available, Locked, Booked)',
        whyChosen: 'Cleanly governs what operations are valid on a seat depending on its lifecycle.',
        alternatives: 'Boolean flags `isLocked`, `isBooked` prone to race conditions.'
      }
    ],

    referenceCode: {
      java: `// Seat Locking Logic in Java
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

enum SeatStatus { AVAILABLE, LOCKED, BOOKED }

class ShowSeat {
    private final String seatId;
    private SeatStatus status = SeatStatus.AVAILABLE;
    private String lockedByUserId;
    private Instant lockExpiresAt;

    public ShowSeat(String seatId) { this.seatId = seatId; }

    public synchronized boolean tryLock(String userId, int ttlSeconds) {
        Instant now = Instant.now();
        if (status == SeatStatus.BOOKED) return false;
        if (status == SeatStatus.LOCKED && lockExpiresAt.isAfter(now)) return false;

        this.status = SeatStatus.LOCKED;
        this.lockedByUserId = userId;
        this.lockExpiresAt = now.plusSeconds(ttlSeconds);
        return true;
    }

    public synchronized boolean confirmBooking(String userId) {
        if (status == SeatStatus.LOCKED && userId.equals(lockedByUserId) && Instant.now().isBefore(lockExpiresAt)) {
            this.status = SeatStatus.BOOKED;
            this.lockedByUserId = null;
            return true;
        }
        return false;
    }
}`,
      python: `# Seat locking with TTL in Python
import time

class ShowSeat:
    def __init__(self, seat_id: str):
        self.seat_id = seat_id
        self.status = 'AVAILABLE' # 'AVAILABLE', 'LOCKED', 'BOOKED'
        self.locked_by = None
        self.lock_expiry = 0

    def try_lock(self, user_id: str, ttl: int = 600) -> bool:
        now = time.time()
        if self.status == 'BOOKED':
            return False
        if self.status == 'LOCKED' and self.lock_expiry > now:
            return False

        self.status = 'LOCKED'
        self.locked_by = user_id
        self.lock_expiry = now + ttl
        return True`
    },

    simulatorType: 'parking-lot'
  },

  {
    id: 'vending-machine',
    dayIndex: 7,
    title: 'Design a State-Machine Vending Machine',
    difficulty: 'Easy',
    company: 'Amazon / Microsoft / Oracle / Cisco',
    estimatedTime: '30 mins',
    category: 'State Pattern & Inventory',
    tags: ['State Pattern', 'Coin Inventory', 'Change Calculation', 'OOP'],
    summary: 'Design an automated vending machine handling coin insertion, product selection, change dispensing, and out-of-stock validation through a strict State Pattern.',
    realWorldContext: 'Physical vending machines require robust deterministic state management so they never dispense products without money or get trapped in invalid coin return loops.',
    
    requirements: {
      functional: [
        'Support inventory slots with item code, name, price, and stock count.',
        'Accept coins and notes (e.g. 1, 5, 10, 20, 50).',
        'State transitions: IDLE -> HAS_MONEY -> DISPENSING -> SOLD_OUT.',
        'Return exact change and cancel transaction returning full inserted amount.'
      ],
      nonFunctional: [
        'State Safety: No product dispensed if inserted amount is less than item price.'
      ],
      outOfScope: ['Hardware motor drive sensor protocol.'],
      clarifyingQuestions: [
        {
          q: 'Why use State Pattern here instead of switch-case?',
          a: 'State Pattern delegates state-specific behavior to concrete State classes (IdleState, HasMoneyState, DispensingState). Adding new states (e.g. MaintenanceState) requires zero edits to existing states.',
          hint: 'Each state implements `insertCoin()`, `selectProduct()`, `dispense()`, `refund()`.'
        }
      ]
    },

    entities: {
      actors: [
        { name: 'Customer', role: 'Inserts money, enters item code, collects product and change' }
      ],
      coreEntities: [
        {
          name: 'VendingMachine',
          description: 'Context maintaining current state, inventory, and inserted balance.',
          attributes: ['state: VendingMachineState', 'inventory: Map<String, ItemShelf>', 'insertedAmount: double'],
          methods: ['insertCoin(double amt)', 'selectItem(String code)', 'dispense()', 'cancel()'],
          relationships: ['Has 1 State. Contains multiple ItemShelves.']
        }
      ]
    },

    classDiagram: {
      mermaid: `classDiagram
    direction TB
    class VendingMachine {
      -State state
      -double balance
      -Map~string, Item~ inventory
      +setState(State)
      +insertMoney(double)
      +pressProduct(string)
      +dispense()
    }
    class State {
      <<interface>>
      +insertMoney(VendingMachine, double)
      +pressProduct(VendingMachine, string)
      +dispense(VendingMachine)
    }
    class IdleState
    class HasMoneyState
    class DispenseState
    State <|.. IdleState
    State <|.. HasMoneyState
    State <|.. DispenseState
    VendingMachine o-- State`
    },

    designPatterns: [
      {
        pattern: 'State Pattern',
        appliedTo: 'VendingMachineState',
        whyChosen: 'Cleanly enforces allowable operations at each step of the vending transaction.',
        alternatives: 'Complex nested conditional flags.'
      }
    ],

    referenceCode: {
      java: `// State Pattern Vending Machine
interface State {
    void insertCoin(VendingMachine m, double amt);
    void selectItem(VendingMachine m, String code);
    void dispense(VendingMachine m);
}

class IdleState implements State {
    public void insertCoin(VendingMachine m, double amt) {
        m.addBalance(amt);
        m.setState(m.getHasMoneyState());
    }
    public void selectItem(VendingMachine m, String code) { System.out.println("Insert money first!"); }
    public void dispense(VendingMachine m) { System.out.println("No item selected."); }
}

class HasMoneyState implements State {
    public void insertCoin(VendingMachine m, double amt) { m.addBalance(amt); }
    public void selectItem(VendingMachine m, String code) {
        // Validate price and inventory then move to DispenseState
        m.setState(m.getDispenseState());
    }
    public void dispense(VendingMachine m) { System.out.println("Select item first!"); }
}`,
      python: `# Python State pattern vending machine
class State:
    def insert_coin(self, machine, amount): pass
    def select_item(self, machine, code): pass
    def dispense(self, machine): pass`
    },

    simulatorType: 'parking-lot'
  }
];

// Helper to get Today's Scenario based on local calendar date
export function getScenarioOfTheDay() {
  const now = new Date();
  // Compute day index from start of year or epoch
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const scenarioIndex = dayOfYear % LLD_SCENARIOS.length;
  return LLD_SCENARIOS[scenarioIndex];
}

// Helper to calculate time left until next day's scenario (midnight)
export function getTimeUntilNextScenario() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = tomorrow - now;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}
