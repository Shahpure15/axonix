# SocraticWingman System Design

## Implementation Approach

We will implement SocraticWingman as a distributed microservices architecture using modern cloud-native patterns. The system will leverage:

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Shadcn-ui components
- **Backend**: Node.js microservices with Express.js and TypeScript
- **Database**: PostgreSQL for relational data + Pinecone/Weaviate for vector embeddings
- **Message Queue**: Redis/RabbitMQ for async processing
- **Code Execution**: Judge0 API or containerized sandbox
- **Authentication**: JWT with refresh tokens, OAuth 2.0
- **Monitoring**: OpenTelemetry with Grafana/Prometheus stack

Key architectural decisions:
1. **Event-driven architecture** for loose coupling between services
2. **CQRS pattern** for separating read/write operations in Learning Vault
3. **Circuit breaker pattern** for external service resilience
4. **Rate limiting** and **distributed caching** for performance
5. **Multi-tenant security** with encrypted data at rest

## Microservices Architecture

### Core Services

1. **API Gateway Service** (Port 3000)
   - Route management and load balancing
   - Rate limiting and request validation
   - JWT token verification
   - CORS handling

2. **Auth Service** (Port 3001)
   - User registration and authentication
   - OAuth 2.0 integration (Google, LinkedIn)
   - JWT token management
   - Password reset flows

3. **User Service** (Port 3002)
   - User profile management
   - Preferences and settings
   - Onboarding workflow

4. **Content Service** (Port 3003)
   - Question repository management
   - Micro-lessons content
   - Tag-based content filtering
   - Content versioning

5. **Session Service** (Port 3004)
   - Session lifecycle management
   - Real-time session events
   - Session state persistence

6. **Tutor Service** (Port 3005)
   - Socratic questioning logic
   - 5-level hint ladder enforcement
   - Learning path adaptation
   - Complex moment detection

7. **Scoring Worker Service** (Port 3006)
   - Code execution orchestration
   - Test case validation
   - Auto-scoring algorithms
   - Feedback generation

8. **SRS Scheduler Service** (Port 3007)
   - Spaced repetition scheduling
   - SM-2 algorithm implementation
   - Due item calculations
   - Review reminders

9. **Analytics Service** (Port 3008)
   - Learning analytics
   - Mastery vector calculations
   - Progress tracking
   - Reporting dashboard data

10. **Notification Service** (Port 3009)
    - Email notifications
    - Push notifications
    - Reminder scheduling

## Data Structures and Interfaces

The system uses a comprehensive data model with strong type safety and clear relationships between entities. All services communicate through well-defined APIs with proper error handling and validation.

## Program Call Flow

The system implements several key workflows including user authentication, diagnostic sessions, learning sessions, and SRS updates. Each workflow is orchestrated through microservices architecture with proper error handling and state management.

## Security Architecture

### Authentication & Authorization
- **JWT Access Tokens**: 15-minute TTL
- **Refresh Tokens**: 7-day TTL, stored in httpOnly cookies
- **OAuth 2.0**: Google and LinkedIn integration
- **Role-based Access Control**: User, Admin, System roles

### Data Protection
- **Encryption at Rest**: AES-256 for PII data
- **Encryption in Transit**: TLS 1.3 everywhere
- **API Security**: Rate limiting, input validation, CORS
- **Database Security**: Connection pooling, prepared statements

### Privacy Compliance
- **Data Retention**: 90-day configurable retention for session traces
- **Opt-in Consent**: User consent for storing learning data
- **Data Anonymization**: PII scrubbing for analytics

## External Integrations

### Code Sandbox Integration
- **Judge0 API**: Primary code execution service
- **Fallback Sandbox**: Self-hosted Docker containers
- **Security**: Resource limits, time limits, network isolation

### Vector Database Integration
- **Pinecone**: Primary vector DB for embeddings
- **Weaviate**: Alternative with self-hosting option
- **Embeddings**: OpenAI text-embedding-ada-002 or open-source alternatives

### Microservices Architecture
- **API Gateway**: Central routing and rate limiting
- **Event-Driven**: Message queues for async communication
- **Service Discovery**: Container orchestration-based
- **Circuit Breakers**: Resilience patterns for service failures

## Deployment Architecture

### Staging Environment
- **Infrastructure**: Docker Compose or Kubernetes
- **Database**: PostgreSQL + Redis
- **Monitoring**: Basic logging and metrics
- **CI/CD**: GitHub Actions with automated testing

### Production Environment
- **Container Orchestration**: Kubernetes or AWS ECS
- **Database**: Managed PostgreSQL (AWS RDS/Azure Database)
- **Caching**: Redis Cluster
- **Load Balancing**: Application Load Balancer
- **Auto-scaling**: HPA based on CPU/memory metrics

## Monitoring and Observability

### Metrics Collection
- **Application Metrics**: Custom business metrics
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Database Metrics**: Query performance, connection pools
- **API Metrics**: Response times, error rates, throughput

### Logging Strategy
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Aggregation**: ELK Stack or cloud-native solutions
- **Sensitive Data**: PII scrubbing in logs

### Distributed Tracing
- **OpenTelemetry**: Cross-service request tracing
- **Span Annotations**: Custom business context
- **Performance Monitoring**: Bottleneck identification

## Performance Optimization

### Caching Strategy
- **Application Cache**: Redis for session data and frequent queries
- **Database Cache**: Query result caching
- **CDN**: Static asset caching for frontend
- **API Response Caching**: GET endpoint caching with TTL

### Database Optimization
- **Read Replicas**: Separate read/write workloads
- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Proper indexing and query analysis
- **Partitioning**: Time-based partitioning for large tables

## Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All services designed to be stateless
- **Load Balancing**: Round-robin and weighted routing
- **Database Sharding**: User-based sharding strategy
- **Queue Scaling**: Auto-scaling workers based on queue depth

### Vertical Scaling
- **Resource Allocation**: CPU and memory optimization
- **Database Tuning**: Configuration optimization
- **JVM Tuning**: Garbage collection optimization (if using Java services)

## Disaster Recovery

### Backup Strategy
- **Database Backups**: Daily automated backups with point-in-time recovery
- **File Backups**: Code and configuration backups
- **Cross-region Replication**: Geographic redundancy

### Recovery Procedures
- **RTO Target**: 1 hour maximum downtime
- **RPO Target**: 15 minutes maximum data loss
- **Failover Testing**: Monthly disaster recovery drills

## Development Workflow

### Code Quality
- **Code Reviews**: Mandatory peer reviews
- **Automated Testing**: Unit, integration, and e2e tests
- **Code Coverage**: Minimum 80% coverage requirement
- **Static Analysis**: ESLint, TypeScript strict mode

### Deployment Pipeline
- **Feature Branches**: Git flow with feature branches
- **Staging Deployment**: Automatic deployment on merge to develop
- **Production Deployment**: Manual approval with blue-green deployment
- **Rollback Strategy**: Quick rollback capability within 5 minutes

## Cost Optimization

### Resource Management
- **Right-sizing**: Regular resource utilization analysis
- **Reserved Instances**: Long-term capacity reservations
- **Spot Instances**: Cost-effective computing for non-critical workloads
- **Auto-scaling**: Scale down during low usage periods

### Monitoring Costs
- **Cost Alerts**: Budget-based alerting
- **Resource Tagging**: Proper cost allocation
- **Usage Analytics**: Regular cost analysis and optimization

## Anything UNCLEAR

The following aspects need clarification:

1. **Service Integration Details**: Specific API contracts and communication patterns between microservices
2. **Vector DB Choice**: Decision between Pinecone (managed) vs Weaviate (self-hosted) based on cost and performance requirements
3. **Code Sandbox Limits**: Specific resource limits, supported languages, and execution time constraints
4. **Data Retention Policies**: Exact requirements for GDPR/CCPA compliance and data anonymization
5. **Third-party API Keys**: Management strategy for external service credentials and rotation policies
6. **Multi-tenant Architecture**: Whether the system should support multiple organizations or remain single-tenant
7. **Mobile App Requirements**: Future mobile app considerations and API compatibility
8. **Internationalization**: Support for multiple languages and localization requirements