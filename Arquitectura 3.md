# IBM Z Backup Discovery and Evidence Flow

This diagram presents the simulated flow used to locate, validate, and document historical backup evidence across an IBM Z environment.

> **Demo note:** The environment and data are fictional. IBM watsonx Assistant for Z and IBM ADDI for IBM Z are represented as simulated components.

```mermaid
flowchart TB
    subgraph USERS["Users"]
        direction LR
        AUD["Audit analyst"]
        DBA["DBA / mainframe owner"]
    end

    subgraph CONV["Conversation layer"]
        WA["IBM watsonx Assistant for Z<br/>(simulated)"]
    end

    S1["1. Catalog lookup"]
    S2["2. Lineage when catalog is empty"]
    S3["3. Locate and validate"]
    S4["4. Seal"]

    subgraph DISC["Discovery layer"]
        ADDI["IBM ADDI for IBM Z<br/>(simulated lineage)"]
    end

    subgraph EVID["Evidence"]
        PKG["Evidence package:<br/>source + timestamp per check"]
    end

    subgraph ESTATE["IBM Z estate (fictional)"]
        direction LR
        DB2["Db2 catalog<br/>SYSCOPY - limited history"]
        BATCH["Batch jobs and<br/>COPY utility runs"]
        ZOS["z/OS catalog,<br/>HSM, virtual tape"]
    end

    AUD -->|asks in plain language| WA
    DBA -->|reviews| PKG

    WA --> S1
    WA --> S2
    WA --> S3
    WA --> S4

    S1 --> DB2
    S2 --> ADDI
    S3 --> BATCH
    S4 --> PKG

    ADDI --> BATCH
    PKG --> ZOS

    classDef user fill:#E8F3FF,stroke:#0F62FE,color:#071D49,stroke-width:1px;
    classDef conversation fill:#0F62FE,stroke:#0043CE,color:#FFFFFF,stroke-width:2px;
    classDef blueStep fill:#E8F3FF,stroke:#4589FF,color:#071D49,stroke-width:1px;
    classDef purpleStep fill:#F2E8FF,stroke:#8A3FFC,color:#071D49,stroke-width:1px;
    classDef greenStep fill:#E5F6E8,stroke:#24A148,color:#071D49,stroke-width:1px;
    classDef discovery fill:#6929C4,stroke:#491D8B,color:#FFFFFF,stroke-width:2px;
    classDef evidence fill:#198038,stroke:#0E6027,color:#FFFFFF,stroke-width:2px;
    classDef estate fill:#EEF4FF,stroke:#78A9FF,color:#071D49,stroke-width:1px;

    class AUD,DBA user;
    class WA conversation;
    class S1,S3 blueStep;
    class S2 purpleStep;
    class S4 greenStep;
    class ADDI discovery;
    class PKG evidence;
    class DB2,BATCH,ZOS estate;

    style USERS fill:#DCEEFF,stroke:#4589FF,color:#071D49
    style CONV fill:#FFF6D6,stroke:#B28600,color:#071D49
    style DISC fill:#FFF6D6,stroke:#B28600,color:#071D49
    style EVID fill:#FFF6D6,stroke:#B28600,color:#071D49
    style ESTATE fill:#FFF6D6,stroke:#B28600,color:#071D49
```

## Flow summary

1. The **audit analyst** asks a question in plain language.
2. The simulated conversation layer directs the request through catalog lookup, lineage discovery, location and validation, and evidence sealing.
3. **IBM ADDI for IBM Z** represents simulated lineage discovery when catalog history is insufficient.
4. The evidence package records the source and timestamp for each check.
5. The **DBA / mainframe owner** reviews the resulting evidence.

## GitHub rendering

GitHub renders Mermaid diagrams directly in Markdown files. If the diagram does not appear, confirm that:

- The file uses the `.md` extension.
- The code block begins with `mermaid` exactly as shown.
- GitHub Enterprise Server is on a version that supports Mermaid diagrams.
