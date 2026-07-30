import type { ContentMap, TopicContent } from "./types";
import { abstraction } from "./topics/abstraction";
import { acidTransactions } from "./topics/acid-transactions";
import { actorModel } from "./topics/actor-model";
import { adapter } from "./topics/adapter";
import { advancedRag } from "./topics/advanced-rag";
import { advancedStructures } from "./topics/advanced-structures";
import { agentFundamentals } from "./topics/agent-fundamentals";
import { aggregates } from "./topics/aggregates";
import { aggregation } from "./topics/aggregation";
import { amortizedAnalysis } from "./topics/amortized-analysis";
import { apiVersioning } from "./topics/api-versioning";
import { arraysStrings } from "./topics/arrays-strings";
import { associationAggregation } from "./topics/association-aggregation";
import { authnVsAuthz } from "./topics/authn-vs-authz";
import { automataTheory } from "./topics/automata-theory";
import { awsCompute } from "./topics/aws-compute";
import { awsDatabases } from "./topics/aws-databases";
import { awsIam } from "./topics/aws-iam";
import { awsNetworking } from "./topics/aws-networking";
import { awsStorage } from "./topics/aws-storage";
import { azureCompute } from "./topics/azure-compute";
import { azureEntra } from "./topics/azure-entra";
import { azureStorage } from "./topics/azure-storage";
import { backgroundJobs } from "./topics/background-jobs";
import { backpressure } from "./topics/backpressure";
import { balancedTrees } from "./topics/balanced-trees";
import { bayesTheorem } from "./topics/bayes-theorem";
import { bigONotation } from "./topics/big-o-notation";
import { binaryTrees } from "./topics/binary-trees";
import { booleanLogic } from "./topics/boolean-logic";
import { boundedContexts } from "./topics/bounded-contexts";
import { branchingMerging } from "./topics/branching-merging";
import { builder } from "./topics/builder";
import { buildingBlocks } from "./topics/building-blocks";
import { buildingMcpServers } from "./topics/building-mcp-servers";
import { cacheInvalidation } from "./topics/cache-invalidation";
import { cacheStrategies } from "./topics/cache-strategies";
import { cachingBasics } from "./topics/caching-basics";
import { capAndNosql } from "./topics/cap-and-nosql";
import { capTheorem } from "./topics/cap-theorem";
import { capacityPlanning } from "./topics/capacity-planning";
import { chaosEngineering } from "./topics/chaos-engineering";
import { chunkingEmbeddings } from "./topics/chunking-embeddings";
import { classDesign } from "./topics/class-design";
import { cloudCost } from "./topics/cloud-cost";
import { codeSmells } from "./topics/code-smells";
import { combinatorics } from "./topics/combinatorics";
import { comments } from "./topics/comments";
import { commonBehavioralQuestions } from "./topics/common-behavioral-questions";
import { commonHrQuestions } from "./topics/common-hr-questions";
import { compilationVsInterpretation } from "./topics/compilation-vs-interpretation";
import { compilersInterpreters } from "./topics/compilers-interpreters";
import { compositionVsInheritance } from "./topics/composition-vs-inheritance";
import { concurrencyModelsBackend } from "./topics/concurrency-models-backend";
import { concurrencyVsParallelism } from "./topics/concurrency-vs-parallelism";
import { configManagement } from "./topics/config-management";
import { consensus } from "./topics/consensus";
import { consistencyModels } from "./topics/consistency-models";
import { consumersGroups } from "./topics/consumers-groups";
import { containerFundamentals } from "./topics/container-fundamentals";
import { contextSwitching } from "./topics/context-switching";
import { continuousDelivery } from "./topics/continuous-delivery";
import { continuousIntegration } from "./topics/continuous-integration";
import { couplingCohesion } from "./topics/coupling-cohesion";
import { cpuArchitecture } from "./topics/cpu-architecture";
import { cpuScheduling } from "./topics/cpu-scheduling";
import { cqrs } from "./topics/cqrs";
import { cryptoBasics } from "./topics/crypto-basics";
import { ctesRecursion } from "./topics/ctes-recursion";
import { dataModelingNosql } from "./topics/data-modeling-nosql";
import { deadlocks } from "./topics/deadlocks";
import { decorator } from "./topics/decorator";
import { deliveryGuarantees } from "./topics/delivery-guarantees";
import { dependencyInversion } from "./topics/dependency-inversion";
import { deploymentModels } from "./topics/deployment-models";
import { designChatSystem } from "./topics/design-chat-system";
import { designNewsFeed } from "./topics/design-news-feed";
import { designRateLimiter } from "./topics/design-rate-limiter";
import { designUrlShortener } from "./topics/design-url-shortener";
import { devopsCulture } from "./topics/devops-culture";
import { distributedCaching } from "./topics/distributed-caching";
import { distributedTracing } from "./topics/distributed-tracing";
import { dns } from "./topics/dns";
import { dockerCompose } from "./topics/docker-compose";
import { dockerNetworking } from "./topics/docker-networking";
import { documentStores } from "./topics/document-stores";
import { dryKissYagni } from "./topics/dry-kiss-yagni";
import { e2eTesting } from "./topics/e2e-testing";
import { edaFundamentals } from "./topics/eda-fundamentals";
import { eigenvalues } from "./topics/eigenvalues";
import { encapsulation } from "./topics/encapsulation";
import { entitiesValueObjects } from "./topics/entities-value-objects";
import { errorHandling } from "./topics/error-handling";
import { esCluster } from "./topics/es-cluster";
import { esMapping } from "./topics/es-mapping";
import { esQuerying } from "./topics/es-querying";
import { estimation } from "./topics/estimation";
import { eventSourcing } from "./topics/event-sourcing";
import { exchangesBindings } from "./topics/exchanges-bindings";
import { factoryMethod } from "./topics/factory-method";
import { faultTolerance } from "./topics/fault-tolerance";
import { fileSystems } from "./topics/file-systems";
import { fineTuning } from "./topics/fine-tuning";
import { functionComposition } from "./topics/function-composition";
import { functions } from "./topics/functions";
import { functorsMonads } from "./topics/functors-monads";
import { garbageCollection } from "./topics/garbage-collection";
import { gcpCompute } from "./topics/gcp-compute";
import { gcpData } from "./topics/gcp-data";
import { gitFundamentals } from "./topics/git-fundamentals";
import { gitInternals } from "./topics/git-internals";
import { gitops } from "./topics/gitops";
import { graphDatabases } from "./topics/graph-databases";
import { graphTheory } from "./topics/graph-theory";
import { graphql } from "./topics/graphql";
import { graphs } from "./topics/graphs";
import { grpc } from "./topics/grpc";
import { hashTables } from "./topics/hash-tables";
import { hashingPasswords } from "./topics/hashing-passwords";
import { heaps } from "./topics/heaps";
import { higherOrderFunctions } from "./topics/higher-order-functions";
import { hldFundamentals } from "./topics/hld-fundamentals";
import { horizontalVertical } from "./topics/horizontal-vertical";
import { hrFundamentals } from "./topics/hr-fundamentals";
import { http } from "./topics/http";
import { idempotency } from "./topics/idempotency";
import { imagesLayers } from "./topics/images-layers";
import { immutability } from "./topics/immutability";
import { indexing } from "./topics/indexing";
import { inferenceOptimization } from "./topics/inference-optimization";
import { infrastructureAsCode } from "./topics/infrastructure-as-code";
import { inheritance } from "./topics/inheritance";
import { injectionAttacks } from "./topics/injection-attacks";
import { integrationTesting } from "./topics/integration-testing";
import { interfaceSegregation } from "./topics/interface-segregation";
import { interfacesAbstractClasses } from "./topics/interfaces-abstract-classes";
import { invertedIndex } from "./topics/inverted-index";
import { ipAddressing } from "./topics/ip-addressing";
import { isolationLevels } from "./topics/isolation-levels";
import { joins } from "./topics/joins";
import { jwt } from "./topics/jwt";
import { k8sArchitecture } from "./topics/k8s-architecture";
import { k8sInternals } from "./topics/k8s-internals";
import { k8sNetworking } from "./topics/k8s-networking";
import { k8sScheduling } from "./topics/k8s-scheduling";
import { k8sStorage } from "./topics/k8s-storage";
import { kafkaFundamentals } from "./topics/kafka-fundamentals";
import { kafkaInternals } from "./topics/kafka-internals";
import { keyValueStores } from "./topics/key-value-stores";
import { latencyThroughput } from "./topics/latency-throughput";
import { lawOfDemeter } from "./topics/law-of-demeter";
import { layeredHexagonal } from "./topics/layered-hexagonal";
import { leaderElection } from "./topics/leader-election";
import { leadershipPrinciples } from "./topics/leadership-principles";
import { linkedLists } from "./topics/linked-lists";
import { linuxFilesystem } from "./topics/linux-filesystem";
import { linuxPerformance } from "./topics/linux-performance";
import { linuxProcesses } from "./topics/linux-processes";
import { linuxShell } from "./topics/linux-shell";
import { liskovSubstitution } from "./topics/liskov-substitution";
import { lldCaseStudies } from "./topics/lld-case-studies";
import { lldFundamentals } from "./topics/lld-fundamentals";
import { llmFundamentals } from "./topics/llm-fundamentals";
import { loadBalancing } from "./topics/load-balancing";
import { lockFreeProgramming } from "./topics/lock-free-programming";
import { locksAndAtomics } from "./topics/locks-and-atomics";
import { logging } from "./topics/logging";
import { mcpFundamentals } from "./topics/mcp-fundamentals";
import { mcpServersTools } from "./topics/mcp-servers-tools";
import { memoryAllocation } from "./topics/memory-allocation";
import { memoryHierarchy } from "./topics/memory-hierarchy";
import { memoryModels } from "./topics/memory-models";
import { metrics } from "./topics/metrics";
import { microservices } from "./topics/microservices";
import { mlBasics } from "./topics/ml-basics";
import { mlEvaluation } from "./topics/ml-evaluation";
import { modelServing } from "./topics/model-serving";
import { monolith } from "./topics/monolith";
import { multiAgent } from "./topics/multi-agent";
import { naming } from "./topics/naming";
import { normalization } from "./topics/normalization";
import { numberSystems } from "./topics/number-systems";
import { oauthOidc } from "./topics/oauth-oidc";
import { observer } from "./topics/observer";
import { openClosed } from "./topics/open-closed";
import { osiTcpipModel } from "./topics/osi-tcpip-model";
import { owaspTop10 } from "./topics/owasp-top-10";
import { pVsNp } from "./topics/p-vs-np";
import { paginationFiltering } from "./topics/pagination-filtering";
import { paradigmsOverview } from "./topics/paradigms-overview";
import { pipelines } from "./topics/pipelines";
import { pkiCertificates } from "./topics/pki-certificates";
import { planningMemory } from "./topics/planning-memory";
import { podsWorkloads } from "./topics/pods-workloads";
import { polymorphism } from "./topics/polymorphism";
import { probabilityBasics } from "./topics/probability-basics";
import { processesVsThreads } from "./topics/processes-vs-threads";
import { profiling } from "./topics/profiling";
import { promptingFundamentals } from "./topics/prompting-fundamentals";
import { promptingTechniques } from "./topics/prompting-techniques";
import { propertyBasedTesting } from "./topics/property-based-testing";
import { proxy } from "./topics/proxy";
import { pureFunctions } from "./topics/pure-functions";
import { queryOptimization } from "./topics/query-optimization";
import { queuesVsPubsub } from "./topics/queues-vs-pubsub";
import { rabbitmqFundamentals } from "./topics/rabbitmq-fundamentals";
import { rabbitmqReliability } from "./topics/rabbitmq-reliability";
import { raceConditions } from "./topics/race-conditions";
import { ragFundamentals } from "./topics/rag-fundamentals";
import { rateLimiting } from "./topics/rate-limiting";
import { rbacAbac } from "./topics/rbac-abac";
import { rebasing } from "./topics/rebasing";
import { recursion } from "./topics/recursion";
import { redisCluster } from "./topics/redis-cluster";
import { redisDataStructures } from "./topics/redis-data-structures";
import { redisPatterns } from "./topics/redis-patterns";
import { redisPersistence } from "./topics/redis-persistence";
import { refactoringSafely } from "./topics/refactoring-safely";
import { refactoringTechniques } from "./topics/refactoring-techniques";
import { relationalModel } from "./topics/relational-model";
import { releaseStrategies } from "./topics/release-strategies";
import { replicationPartitioning } from "./topics/replication-partitioning";
import { requestLifecycle } from "./topics/request-lifecycle";
import { resiliencePatterns } from "./topics/resilience-patterns";
import { rest } from "./topics/rest";
import { retrievalStrategies } from "./topics/retrieval-strategies";
import { sagaPattern } from "./topics/saga-pattern";
import { salaryNegotiation } from "./topics/salary-negotiation";
import { secureCoding } from "./topics/secure-coding";
import { separationOfConcerns } from "./topics/separation-of-concerns";
import { serverlessArch } from "./topics/serverless-arch";
import { serviceModels } from "./topics/service-models";
import { sessionsVsTokens } from "./topics/sessions-vs-tokens";
import { setTheoryLogic } from "./topics/set-theory-logic";
import { sharding } from "./topics/sharding";
import { sharedResponsibility } from "./topics/shared-responsibility";
import { singleResponsibility } from "./topics/single-responsibility";
import { singleton } from "./topics/singleton";
import { sliSloSla } from "./topics/sli-slo-sla";
import { sqlBasics } from "./topics/sql-basics";
import { sre } from "./topics/sre";
import { stacksQueues } from "./topics/stacks-queues";
import { starMethod } from "./topics/star-method";
import { state } from "./topics/state";
import { statisticsBasics } from "./topics/statistics-basics";
import { strategy } from "./topics/strategy";
import { structuredOutput } from "./topics/structured-output";
import { synchronizationPrimitives } from "./topics/synchronization-primitives";
import { systemDesignFramework } from "./topics/system-design-framework";
import { tcpHandshake } from "./topics/tcp-handshake";
import { tcpUdp } from "./topics/tcp-udp";
import { tdd } from "./topics/tdd";
import { testDoubles } from "./topics/test-doubles";
import { testPyramid } from "./topics/test-pyramid";
import { threadsVsAsync } from "./topics/threads-vs-async";
import { timeOrdering } from "./topics/time-ordering";
import { timeSpaceComplexity } from "./topics/time-space-complexity";
import { tlsSsl } from "./topics/tls-ssl";
import { tokenizationEmbeddings } from "./topics/tokenization-embeddings";
import { toolUse } from "./topics/tool-use";
import { topicsPartitions } from "./topics/topics-partitions";
import { tradeoffAnalysis } from "./topics/tradeoff-analysis";
import { tries } from "./topics/tries";
import { turingMachines } from "./topics/turing-machines";
import { typeSystems } from "./topics/type-systems";
import { ubiquitousLanguage } from "./topics/ubiquitous-language";
import { unitTesting } from "./topics/unit-testing";
import { vectorsMatrices } from "./topics/vectors-matrices";
import { virtualMachines } from "./topics/virtual-machines";
import { virtualMemory } from "./topics/virtual-memory";
import { wideColumn } from "./topics/wide-column";
import { windowFunctions } from "./topics/window-functions";
import cloudComputing from "./topics/cloud-computing";

export const CONTENT: ContentMap = {
  "abstraction": abstraction,
  "acid-transactions": acidTransactions,
  "actor-model": actorModel,
  "adapter": adapter,
  "advanced-rag": advancedRag,
  "advanced-structures": advancedStructures,
  "agent-fundamentals": agentFundamentals,
  "aggregates": aggregates,
  "aggregation": aggregation,
  "amortized-analysis": amortizedAnalysis,
  "api-versioning": apiVersioning,
  "arrays-strings": arraysStrings,
  "association-aggregation": associationAggregation,
  "authn-vs-authz": authnVsAuthz,
  "automata-theory": automataTheory,
  "aws-compute": awsCompute,
  "aws-databases": awsDatabases,
  "aws-iam": awsIam,
  "aws-networking": awsNetworking,
  "aws-storage": awsStorage,
  "azure-compute": azureCompute,
  "azure-entra": azureEntra,
  "azure-storage": azureStorage,
  "background-jobs": backgroundJobs,
  "backpressure": backpressure,
  "balanced-trees": balancedTrees,
  "bayes-theorem": bayesTheorem,
  "big-o-notation": bigONotation,
  "binary-trees": binaryTrees,
  "boolean-logic": booleanLogic,
  "bounded-contexts": boundedContexts,
  "branching-merging": branchingMerging,
  "builder": builder,
  "building-blocks": buildingBlocks,
  "building-mcp-servers": buildingMcpServers,
  "cache-invalidation": cacheInvalidation,
  "cache-strategies": cacheStrategies,
  "caching-basics": cachingBasics,
  "cap-and-nosql": capAndNosql,
  "cap-theorem": capTheorem,
  "capacity-planning": capacityPlanning,
  "chaos-engineering": chaosEngineering,
  "chunking-embeddings": chunkingEmbeddings,
  "class-design": classDesign,
  "cloud-computing": cloudComputing,
  "cloud-cost": cloudCost,
  "code-smells": codeSmells,
  "combinatorics": combinatorics,
  "comments": comments,
  "common-behavioral-questions": commonBehavioralQuestions,
  "common-hr-questions": commonHrQuestions,
  "compilation-vs-interpretation": compilationVsInterpretation,
  "compilers-interpreters": compilersInterpreters,
  "composition-vs-inheritance": compositionVsInheritance,
  "concurrency-models-backend": concurrencyModelsBackend,
  "concurrency-vs-parallelism": concurrencyVsParallelism,
  "config-management": configManagement,
  "consensus": consensus,
  "consistency-models": consistencyModels,
  "consumers-groups": consumersGroups,
  "container-fundamentals": containerFundamentals,
  "context-switching": contextSwitching,
  "continuous-delivery": continuousDelivery,
  "continuous-integration": continuousIntegration,
  "coupling-cohesion": couplingCohesion,
  "cpu-architecture": cpuArchitecture,
  "cpu-scheduling": cpuScheduling,
  "cqrs": cqrs,
  "crypto-basics": cryptoBasics,
  "ctes-recursion": ctesRecursion,
  "data-modeling-nosql": dataModelingNosql,
  "deadlocks": deadlocks,
  "decorator": decorator,
  "delivery-guarantees": deliveryGuarantees,
  "dependency-inversion": dependencyInversion,
  "deployment-models": deploymentModels,
  "design-chat-system": designChatSystem,
  "design-news-feed": designNewsFeed,
  "design-rate-limiter": designRateLimiter,
  "design-url-shortener": designUrlShortener,
  "devops-culture": devopsCulture,
  "distributed-caching": distributedCaching,
  "distributed-tracing": distributedTracing,
  "dns": dns,
  "docker-compose": dockerCompose,
  "docker-networking": dockerNetworking,
  "document-stores": documentStores,
  "dry-kiss-yagni": dryKissYagni,
  "e2e-testing": e2eTesting,
  "eda-fundamentals": edaFundamentals,
  "eigenvalues": eigenvalues,
  "encapsulation": encapsulation,
  "entities-value-objects": entitiesValueObjects,
  "error-handling": errorHandling,
  "es-cluster": esCluster,
  "es-mapping": esMapping,
  "es-querying": esQuerying,
  "estimation": estimation,
  "event-sourcing": eventSourcing,
  "exchanges-bindings": exchangesBindings,
  "factory-method": factoryMethod,
  "fault-tolerance": faultTolerance,
  "file-systems": fileSystems,
  "fine-tuning": fineTuning,
  "function-composition": functionComposition,
  "functions": functions,
  "functors-monads": functorsMonads,
  "garbage-collection": garbageCollection,
  "gcp-compute": gcpCompute,
  "gcp-data": gcpData,
  "git-fundamentals": gitFundamentals,
  "git-internals": gitInternals,
  "gitops": gitops,
  "graph-databases": graphDatabases,
  "graph-theory": graphTheory,
  "graphql": graphql,
  "graphs": graphs,
  "grpc": grpc,
  "hash-tables": hashTables,
  "hashing-passwords": hashingPasswords,
  "heaps": heaps,
  "higher-order-functions": higherOrderFunctions,
  "hld-fundamentals": hldFundamentals,
  "horizontal-vertical": horizontalVertical,
  "hr-fundamentals": hrFundamentals,
  "http": http,
  "idempotency": idempotency,
  "images-layers": imagesLayers,
  "immutability": immutability,
  "indexing": indexing,
  "inference-optimization": inferenceOptimization,
  "infrastructure-as-code": infrastructureAsCode,
  "inheritance": inheritance,
  "injection-attacks": injectionAttacks,
  "integration-testing": integrationTesting,
  "interface-segregation": interfaceSegregation,
  "interfaces-abstract-classes": interfacesAbstractClasses,
  "inverted-index": invertedIndex,
  "ip-addressing": ipAddressing,
  "isolation-levels": isolationLevels,
  "joins": joins,
  "jwt": jwt,
  "k8s-architecture": k8sArchitecture,
  "k8s-internals": k8sInternals,
  "k8s-networking": k8sNetworking,
  "k8s-scheduling": k8sScheduling,
  "k8s-storage": k8sStorage,
  "kafka-fundamentals": kafkaFundamentals,
  "kafka-internals": kafkaInternals,
  "key-value-stores": keyValueStores,
  "latency-throughput": latencyThroughput,
  "law-of-demeter": lawOfDemeter,
  "layered-hexagonal": layeredHexagonal,
  "leader-election": leaderElection,
  "leadership-principles": leadershipPrinciples,
  "linked-lists": linkedLists,
  "linux-filesystem": linuxFilesystem,
  "linux-performance": linuxPerformance,
  "linux-processes": linuxProcesses,
  "linux-shell": linuxShell,
  "liskov-substitution": liskovSubstitution,
  "lld-case-studies": lldCaseStudies,
  "lld-fundamentals": lldFundamentals,
  "llm-fundamentals": llmFundamentals,
  "load-balancing": loadBalancing,
  "lock-free-programming": lockFreeProgramming,
  "locks-and-atomics": locksAndAtomics,
  "logging": logging,
  "mcp-fundamentals": mcpFundamentals,
  "mcp-servers-tools": mcpServersTools,
  "memory-allocation": memoryAllocation,
  "memory-hierarchy": memoryHierarchy,
  "memory-models": memoryModels,
  "metrics": metrics,
  "microservices": microservices,
  "ml-basics": mlBasics,
  "ml-evaluation": mlEvaluation,
  "model-serving": modelServing,
  "monolith": monolith,
  "multi-agent": multiAgent,
  "naming": naming,
  "normalization": normalization,
  "number-systems": numberSystems,
  "oauth-oidc": oauthOidc,
  "observer": observer,
  "open-closed": openClosed,
  "osi-tcpip-model": osiTcpipModel,
  "owasp-top-10": owaspTop10,
  "p-vs-np": pVsNp,
  "pagination-filtering": paginationFiltering,
  "paradigms-overview": paradigmsOverview,
  "pipelines": pipelines,
  "pki-certificates": pkiCertificates,
  "planning-memory": planningMemory,
  "pods-workloads": podsWorkloads,
  "polymorphism": polymorphism,
  "probability-basics": probabilityBasics,
  "processes-vs-threads": processesVsThreads,
  "profiling": profiling,
  "prompting-fundamentals": promptingFundamentals,
  "prompting-techniques": promptingTechniques,
  "property-based-testing": propertyBasedTesting,
  "proxy": proxy,
  "pure-functions": pureFunctions,
  "query-optimization": queryOptimization,
  "queues-vs-pubsub": queuesVsPubsub,
  "rabbitmq-fundamentals": rabbitmqFundamentals,
  "rabbitmq-reliability": rabbitmqReliability,
  "race-conditions": raceConditions,
  "rag-fundamentals": ragFundamentals,
  "rate-limiting": rateLimiting,
  "rbac-abac": rbacAbac,
  "rebasing": rebasing,
  "recursion": recursion,
  "redis-cluster": redisCluster,
  "redis-data-structures": redisDataStructures,
  "redis-patterns": redisPatterns,
  "redis-persistence": redisPersistence,
  "refactoring-safely": refactoringSafely,
  "refactoring-techniques": refactoringTechniques,
  "relational-model": relationalModel,
  "release-strategies": releaseStrategies,
  "replication-partitioning": replicationPartitioning,
  "request-lifecycle": requestLifecycle,
  "resilience-patterns": resiliencePatterns,
  "rest": rest,
  "retrieval-strategies": retrievalStrategies,
  "saga-pattern": sagaPattern,
  "salary-negotiation": salaryNegotiation,
  "secure-coding": secureCoding,
  "separation-of-concerns": separationOfConcerns,
  "serverless-arch": serverlessArch,
  "service-models": serviceModels,
  "sessions-vs-tokens": sessionsVsTokens,
  "set-theory-logic": setTheoryLogic,
  "sharding": sharding,
  "shared-responsibility": sharedResponsibility,
  "single-responsibility": singleResponsibility,
  "singleton": singleton,
  "sli-slo-sla": sliSloSla,
  "sql-basics": sqlBasics,
  "sre": sre,
  "stacks-queues": stacksQueues,
  "star-method": starMethod,
  "state": state,
  "statistics-basics": statisticsBasics,
  "strategy": strategy,
  "structured-output": structuredOutput,
  "synchronization-primitives": synchronizationPrimitives,
  "system-design-framework": systemDesignFramework,
  "tcp-handshake": tcpHandshake,
  "tcp-udp": tcpUdp,
  "tdd": tdd,
  "test-doubles": testDoubles,
  "test-pyramid": testPyramid,
  "threads-vs-async": threadsVsAsync,
  "time-ordering": timeOrdering,
  "time-space-complexity": timeSpaceComplexity,
  "tls-ssl": tlsSsl,
  "tokenization-embeddings": tokenizationEmbeddings,
  "tool-use": toolUse,
  "topics-partitions": topicsPartitions,
  "tradeoff-analysis": tradeoffAnalysis,
  "tries": tries,
  "turing-machines": turingMachines,
  "type-systems": typeSystems,
  "ubiquitous-language": ubiquitousLanguage,
  "unit-testing": unitTesting,
  "vectors-matrices": vectorsMatrices,
  "virtual-machines": virtualMachines,
  "virtual-memory": virtualMemory,
  "wide-column": wideColumn,
  "window-functions": windowFunctions,
};

export function getContent(topicSlug: string): TopicContent | undefined {
  return CONTENT[topicSlug];
}

