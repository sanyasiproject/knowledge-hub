import type { TopicContent } from "../types";

export const configManagement: TopicContent = {
  quickSummary: [
    "Configuration management tools (Ansible, Chef, Puppet, SaltStack) automate the process of bringing servers to a desired state — installing packages, managing files, starting services — consistently across fleets of machines.",
    "Desired state configuration means you declare what a server should look like (packages installed, files present, services running) and the tool converges the machine toward that state, regardless of its current condition.",
    "Idempotent operations are the cornerstone: running the same playbook or manifest ten times produces the same result as running it once, making repeated application safe.",
    "Drift detection compares actual server state against the declared configuration and reports or corrects any deviations, preventing configuration snowflakes.",
  ],
  detailed: [
    "## The Problem Configuration Management Solves\n\nManually configuring servers leads to 'snowflake' machines — each one slightly different based on who set it up and when. These differences cause mysterious production bugs that cannot be reproduced in staging. Configuration management eliminates this by codifying every aspect of a server's setup. The configuration is version-controlled, peer-reviewed, and applied uniformly, ensuring every server in a tier is identical.",

    "## Ansible\n\nAnsible is agentless — it connects to target machines over SSH (or WinRM for Windows) and executes tasks. Playbooks are written in YAML and describe a sequence of tasks using built-in modules (apt, yum, copy, template, service, etc.). Ansible is push-based by default: you run `ansible-playbook` from a control node and it reaches out to targets. Its simplicity and low barrier to entry (no agent installation needed) have made it the most widely adopted configuration management tool. Ansible Galaxy provides reusable roles shared by the community.",

    "## Chef and Puppet\n\nChef uses Ruby-based DSL 'recipes' grouped into 'cookbooks.' A Chef client agent runs on each node, pulls its configuration from a central Chef Server, and converges the node to the desired state. Puppet uses its own declarative language to define 'manifests' organized into 'modules.' A Puppet agent runs on each node and periodically checks in with the Puppet Server. Both are pull-based: agents poll the server rather than the server pushing to agents. This model scales well for large fleets but requires maintaining the agent infrastructure.",

    "## Idempotency and Convergence\n\nAn idempotent operation produces the same result whether applied once or many times. Configuration management modules are designed to be idempotent: 'ensure package nginx is installed' checks first, installs only if absent. 'Ensure file /etc/nginx/nginx.conf has these contents' compares checksums, writes only if different. This allows safe re-runs — you can apply the full configuration hourly as a drift-correction mechanism without side effects. Convergence means the tool brings the system closer to the desired state with each run, even if some steps fail.",

    "## Drift Detection and Remediation\n\nDrift occurs when someone logs into a server and makes a manual change, or when an automated process modifies files outside the configuration management tool. Puppet detects drift on every agent run (default: every 30 minutes) and can either report it or automatically correct it. Ansible detects drift by running in check mode (`--check --diff`), which shows what would change without making changes. Chef's `why-run` mode serves the same purpose. Treating drift correction as a continuous process rather than a one-time fix is essential for maintaining fleet consistency.",

    "## Best Practices\n\nUse roles/cookbooks/modules for reusability. Keep secrets out of version control — use Ansible Vault, Chef encrypted data bags, or external vaults. Test configurations with tools like Molecule (Ansible), Test Kitchen (Chef), or rspec-puppet. Apply the principle of least privilege to the control node. Use inventory groups or node classifiers to target configurations precisely. Maintain separate configurations for different environments while sharing common baselines.",
  ],
  interviewQA: [
    {
      q: "What is the difference between push-based and pull-based configuration management?",
      a: "Push-based systems (Ansible) have a control node that initiates connections to targets and executes tasks remotely. Pull-based systems (Puppet, Chef) install an agent on each target node that periodically contacts a central server, downloads its configuration, and applies it locally. Push is simpler to set up (no agents), while pull scales better for large fleets and provides continuous drift correction without manual intervention.",
      followUps: [
        "Can Ansible be used in a pull-based mode?",
        "What are the security implications of each model?",
      ],
    },
    {
      q: "Why is idempotency important in configuration management?",
      a: "Idempotency ensures that applying a configuration multiple times produces the same result as applying it once. This is critical because configuration management tools are typically run repeatedly — on schedule, after code changes, or for drift correction. Without idempotency, re-running a playbook could duplicate users, append duplicate lines to files, or restart services unnecessarily. Idempotent modules check current state before acting, making re-application safe and predictable.",
      followUps: [
        "Give an example of a non-idempotent operation and how you would make it idempotent.",
        "How do shell/command modules in Ansible handle idempotency?",
      ],
    },
    {
      q: "How do you manage secrets in configuration management?",
      a: "Ansible Vault encrypts sensitive variables or entire files with AES-256, decrypting at runtime with a vault password. Chef uses encrypted data bags or integrates with HashiCorp Vault. Puppet has Hiera eyaml for encrypting values within configuration data. In all cases, the goal is to keep secrets out of plaintext in version control while making them available at apply time. External secret stores (AWS Secrets Manager, Vault) are increasingly preferred for centralized secret lifecycle management.",
    },
    {
      q: "How would you test configuration management code before applying it to production?",
      a: "Use a layered testing approach. Linting tools (ansible-lint, puppet-lint, cookstyle) catch syntax and style issues. Unit testing frameworks (Molecule for Ansible, rspec-puppet, ChefSpec) test individual roles or modules in isolation. Integration tests spin up real VMs or containers (Vagrant, Docker, Test Kitchen) and apply the full configuration, then verify with tools like Testinfra or InSpec. Finally, apply to a staging environment that mirrors production before promoting changes.",
    },
  ],
  mcqs: [
    {
      q: "Which configuration management tool is agentless by default?",
      options: ["Puppet", "Chef", "Ansible", "SaltStack"],
      answerIndex: 2,
      explanation: "Ansible connects to target machines over SSH without requiring any agent software to be installed on them.",
    },
    {
      q: "What does Puppet's agent do by default every 30 minutes?",
      options: [
        "Pushes local changes to the Puppet Server",
        "Pulls its catalog from the server and converges the node to the desired state",
        "Backs up the node's configuration to a remote store",
        "Scans for security vulnerabilities and reports them",
      ],
      answerIndex: 1,
      explanation: "The Puppet agent periodically contacts the Puppet Server, receives a compiled catalog of desired state, and applies it to the node, correcting any drift.",
    },
    {
      q: "What is the Ansible equivalent of Puppet manifests or Chef recipes?",
      options: ["Inventories", "Playbooks", "Vaults", "Galaxies"],
      answerIndex: 1,
      explanation: "Ansible playbooks are YAML files that define the tasks and roles to apply to target hosts.",
    },
    {
      q: "Which flag runs an Ansible playbook in dry-run mode to detect drift?",
      options: ["--dry-run", "--check", "--noop", "--plan"],
      answerIndex: 1,
      explanation: "`ansible-playbook --check` runs in check mode, reporting what would change without making actual modifications. Adding `--diff` shows the specific differences.",
    },
    {
      q: "What does Ansible Vault provide?",
      options: [
        "A container orchestration layer",
        "Encryption for sensitive data in playbooks and variable files",
        "A package repository for custom modules",
        "A graphical dashboard for playbook runs",
      ],
      answerIndex: 1,
      explanation: "Ansible Vault encrypts files or variables with AES-256, allowing secrets to be stored safely in version control and decrypted at runtime.",
    },
  ],
  flashcards: [
    { front: "What is a Puppet manifest?", back: "A file written in Puppet's declarative language that describes the desired state of resources on a node." },
    { front: "What is a Chef cookbook?", back: "A collection of recipes, templates, files, and metadata that defines a configuration policy for a specific concern (e.g., installing nginx)." },
    { front: "What is an Ansible role?", back: "A reusable, self-contained unit of Ansible automation with a standardized directory structure containing tasks, handlers, templates, variables, and defaults." },
    { front: "What is convergence in configuration management?", back: "The process by which a tool brings a system's actual state closer to the declared desired state with each run." },
    { front: "What is Ansible Galaxy?", back: "A community hub for sharing and downloading reusable Ansible roles and collections." },
    { front: "What is a Chef node?", back: "Any machine (physical, virtual, cloud, or container) managed by Chef, running the Chef client agent." },
    { front: "What is Hiera in Puppet?", back: "A key-value lookup tool for separating data from Puppet code, enabling environment-specific and role-specific configuration values." },
    { front: "What is an Ansible inventory?", back: "A file or script that defines the target hosts and groups that Ansible manages, along with connection variables." },
  ],
  glossary: [
    { term: "Configuration Management", definition: "The practice of automating and standardizing the configuration of servers and infrastructure to ensure consistency and repeatability." },
    { term: "Desired State", definition: "The declared target configuration that a system should have — the tool's job is to make reality match this declaration." },
    { term: "Idempotent", definition: "An operation that produces the same result regardless of how many times it is executed." },
    { term: "Drift", definition: "The divergence between a system's actual configuration and its declared desired state, typically caused by manual changes." },
    { term: "Agentless", definition: "A configuration management approach that does not require installing agent software on managed nodes, instead connecting over SSH or WinRM." },
    { term: "Convergence", definition: "The process of bringing a system closer to its desired state, handling partial failures gracefully across multiple runs." },
    { term: "Playbook", definition: "An Ansible YAML file containing an ordered list of plays (task sets) to execute against specified hosts." },
    { term: "Catalog", definition: "In Puppet, the compiled set of resources and their desired states for a specific node, generated by the Puppet Server." },
  ],
};
