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
  followUps: [
    "Where should configuration live — image, environment, or a config service?",
    "How do you roll out a config change safely, and how do you roll it back?",
    "Why is configuration a more common outage cause than code?",
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
  deepDive: [
    "## How Ansible Executes Tasks Under the Hood\n\nWhen you run `ansible-playbook`, the control node compiles each task into a small Python script (or PowerShell on Windows targets). It copies this script to the remote machine over SSH using SFTP or SCP, executes it, captures the JSON output, and deletes the temporary files. This is why Ansible requires Python on managed nodes. The execution is sequential by default within a play but can be parallelized across hosts using the `forks` setting (default: 5). Ansible uses facts gathered at play start (`setup` module) to populate variables like `ansible_os_family` or `ansible_distribution_version`, enabling conditional logic. Handlers are deferred tasks that only run when notified by a changed task and are flushed at the end of a play or when explicitly triggered with `meta: flush_handlers`. Connection plugins abstract the transport layer, allowing SSH, WinRM, `local`, `docker`, and `network_cli` connections. Callback plugins capture execution events for logging, notification, or custom reporting. The variable precedence system has 22 levels, from command-line `--extra-vars` (highest) down to role defaults (lowest), which can be a source of subtle bugs if not well understood.",

    "## Puppet's Compilation and Catalog Model\n\nPuppet operates on a client-server compilation model. When a Puppet agent checks in, it sends its facts (gathered by Facter) to the Puppet Server. The server evaluates the node's classification (via `site.pp`, an External Node Classifier, or Hiera data), compiles the Puppet manifests into a **catalog** -- a directed acyclic graph (DAG) of resources and their relationships. The catalog is sent back to the agent, which applies it using a resource abstraction layer (RAL) that maps high-level resource types to OS-specific providers (e.g., the `package` type uses `apt` on Debian, `yum` on RHEL). Puppet enforces ordering through explicit `require`, `before`, `notify`, and `subscribe` metaparameters or the `->` and `~>` chaining arrows. Without explicit ordering, Puppet applies resources in an undefined order, which is a deliberate design choice to force authors to declare dependencies. The PuppetDB stores facts, catalogs, and reports, enabling exported resources (sharing configuration data between nodes) and powerful queries about your infrastructure state.",

    "## Immutable Infrastructure vs. Configuration Management\n\nA growing school of thought argues that mutable server configuration should be replaced with immutable infrastructure: rather than updating a running server with Ansible or Puppet, you build a new machine image (AMI, Docker image) with the desired state baked in and replace the old instance entirely. Tools like Packer use Ansible or Chef as provisioners during image build, then the resulting artifact is deployed via Terraform or Kubernetes. This eliminates drift entirely -- there is nothing to drift because no one ever logs into the server. However, immutable infrastructure has trade-offs: longer deployment cycles (building images takes minutes), more complex secret injection at runtime, difficulty with stateful workloads, and the need for robust blue-green or rolling deployment pipelines. In practice, most organizations use a hybrid: immutable base images built with config management, combined with lightweight runtime configuration for secrets and environment-specific settings.",
  ],
  code: [
    {
      language: "yaml",
      caption: "Ansible playbook: Install and configure Nginx with a custom virtual host",
      source: `---
- name: Configure web servers
  hosts: webservers
  become: true
  vars:
    nginx_port: 80
    server_name: app.example.com
    document_root: /var/www/app

  tasks:
    - name: Install Nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true
      when: ansible_os_family == "Debian"

    - name: Create document root
      ansible.builtin.file:
        path: "{{ document_root }}"
        state: directory
        owner: www-data
        group: www-data
        mode: "0755"

    - name: Deploy virtual host configuration
      ansible.builtin.template:
        src: templates/vhost.conf.j2
        dest: /etc/nginx/sites-available/{{ server_name }}.conf
        owner: root
        group: root
        mode: "0644"
      notify: Reload Nginx

    - name: Enable virtual host
      ansible.builtin.file:
        src: /etc/nginx/sites-available/{{ server_name }}.conf
        dest: /etc/nginx/sites-enabled/{{ server_name }}.conf
        state: link
      notify: Reload Nginx

    - name: Ensure Nginx is running and enabled
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Reload Nginx
      ansible.builtin.service:
        name: nginx
        state: reloaded`,
    },
    {
      language: "puppet",
      caption: "Puppet manifest: Manage NTP service with platform-aware package and configuration",
      source: `# modules/ntp/manifests/init.pp
class ntp (
  String $server_list = 'pool.ntp.org',
  Boolean $restrict   = true,
) {
  $package_name = $facts['os']['family'] ? {
    'Debian' => 'ntp',
    'RedHat' => 'chrony',
    default  => fail("Unsupported OS family: \${facts['os']['family']}"),
  }

  $service_name = $facts['os']['family'] ? {
    'Debian' => 'ntp',
    'RedHat' => 'chronyd',
  }

  $config_path = $facts['os']['family'] ? {
    'Debian' => '/etc/ntp.conf',
    'RedHat' => '/etc/chrony.conf',
  }

  package { $package_name:
    ensure => installed,
  }

  file { $config_path:
    ensure  => file,
    owner   => 'root',
    group   => 'root',
    mode    => '0644',
    content => epp('ntp/ntp.conf.epp', {
      'servers'  => $server_list,
      'restrict' => $restrict,
    }),
    require => Package[$package_name],
    notify  => Service[$service_name],
  }

  service { $service_name:
    ensure    => running,
    enable    => true,
    subscribe => File[$config_path],
  }
}`,
    },
    {
      language: "ruby",
      caption: "Chef recipe: Install and configure PostgreSQL with a database and user",
      source: `# cookbooks/postgresql/recipes/default.rb

package 'postgresql' do
  version node['postgresql']['version']
  action :install
end

package 'postgresql-contrib' do
  action :install
end

template '/etc/postgresql/main/postgresql.conf' do
  source 'postgresql.conf.erb'
  owner 'postgres'
  group 'postgres'
  mode '0644'
  variables(
    listen_addresses: node['postgresql']['listen_addresses'],
    port: node['postgresql']['port'],
    max_connections: node['postgresql']['max_connections'],
    shared_buffers: node['postgresql']['shared_buffers']
  )
  notifies :restart, 'service[postgresql]', :delayed
end

template '/etc/postgresql/main/pg_hba.conf' do
  source 'pg_hba.conf.erb'
  owner 'postgres'
  group 'postgres'
  mode '0640'
  variables(
    allowed_networks: node['postgresql']['allowed_networks']
  )
  notifies :reload, 'service[postgresql]', :delayed
end

service 'postgresql' do
  action [:enable, :start]
end

execute 'create_app_database' do
  user 'postgres'
  command "psql -tc \\"SELECT 1 FROM pg_database WHERE datname='app_production'\\" | grep -q 1 || createdb app_production"
  action :run
end

execute 'create_app_user' do
  user 'postgres'
  command "psql -tc \\"SELECT 1 FROM pg_roles WHERE rolname='app_user'\\" | grep -q 1 || psql -c \\"CREATE ROLE app_user WITH LOGIN PASSWORD 'CHANGE_ME' CREATEDB\\""
  sensitive true
  action :run
end`,
    },
  ],
  comparison: {
    columns: ["Feature", "Ansible", "Puppet", "Chef", "SaltStack"],
    rows: [
      ["Architecture", "Agentless (SSH push)", "Agent-based (pull)", "Agent-based (pull)", "Agent or agentless (ZeroMQ)"],
      ["Language", "YAML (playbooks)", "Puppet DSL (declarative)", "Ruby DSL (imperative)", "YAML (state files)"],
      ["Learning Curve", "Low -- YAML is approachable", "Medium -- custom DSL to learn", "High -- requires Ruby knowledge", "Medium -- YAML but complex jinja"],
      ["Scalability", "Good (thousands of nodes)", "Excellent (tens of thousands)", "Excellent (tens of thousands)", "Excellent (ZeroMQ is fast)"],
      ["Idempotency", "Built into modules", "Core design principle", "Built into resources", "Built into state modules"],
      ["Secret Management", "Ansible Vault (AES-256)", "Hiera eyaml, Vault integration", "Encrypted data bags", "Pillar with GPG encryption"],
      ["Community Content", "Ansible Galaxy (roles/collections)", "Puppet Forge (modules)", "Chef Supermarket (cookbooks)", "Salt Formulas (GitHub)"],
      ["Testing Tools", "Molecule, ansible-lint", "rspec-puppet, puppet-lint", "Test Kitchen, ChefSpec, cookstyle", "pytest-salt, salt-lint"],
      ["Windows Support", "WinRM, native modules", "Native support, PuppetDB", "Native support", "Native support"],
      ["Cloud Integration", "Extensive cloud modules", "Cloud provisioner module", "Knife plugins", "Salt Cloud"],
    ],
  },
  diagrams: [
    {
      title: "Pull vs Push Configuration Architecture",
      kind: "architecture",
      caption: "Pull model: agents on nodes periodically poll the config server. Push model: a control machine initiates connections to managed nodes.",
      mermaid: `graph TB
    subgraph Pull["Pull Model - Puppet Chef"]
        CS["Config Server"]
        A1["Node Agent 1"] -->|"poll every 30min"| CS
        A2["Node Agent 2"] -->|"poll every 30min"| CS
        A3["Node Agent 3"] -->|"poll every 30min"| CS
        CS --> VCS["Version Control"]
        CS --> DB["Facts Database"]
    end
    subgraph Push["Push Model - Ansible"]
        CM["Control Machine"]
        CM -->|"SSH"| N1["Node 1"]
        CM -->|"SSH"| N2["Node 2"]
        CM -->|"SSH"| N3["Node 3"]
        INV["Inventory File"] --> CM
    end`,
    },
    {
      title: "Ansible Playbook Execution Flow",
      kind: "flow",
      caption: "Step-by-step flow of an Ansible playbook run from inventory parsing through fact gathering, task execution, handler notification, and result reporting.",
      mermaid: `flowchart TD
    Start["ansible-playbook run"] --> Inv["Parse inventory"]
    Inv --> Facts["Gather facts via setup module"]
    Facts --> Tasks["Compile tasks with Jinja2"]
    Tasks --> Check{"Condition met?"}
    Check -->|"No"| Skip["Skip task"]
    Check -->|"Yes"| Transfer["Transfer module to remote"]
    Transfer --> Exec["Execute with sudo if needed"]
    Exec --> Result{"Result?"}
    Result -->|"changed"| Notify["Notify handlers"]
    Result -->|"failed"| Fail["Abort or rescue block"]
    Result -->|"ok"| Next["Next task"]
    Notify --> Flush["Flush handlers at end of play"]
    Flush --> Report["Print play recap"]`,
    },
    {
      title: "Configuration Management Tool Landscape",
      kind: "mindmap",
      caption: "Mindmap of configuration management tools categorized by approach, language, and key characteristics.",
      mermaid: `mindmap
  root["Config Management Tools"]
    Ansible
      Agentless SSH push
      YAML playbooks
      Jinja2 templates
      Ansible Vault secrets
      Galaxy roles registry
    Puppet
      Agent pull model
      Declarative DSL
      PuppetDB facts
      Hiera hierarchy
      Forge modules
    Chef
      Ruby DSL cookbooks
      Chef Server pull
      Test Kitchen
      Data bags secrets
    SaltStack
      Agent or agentless
      YAML states
      Pillar secrets
      Salt Cloud`,
    },
    {
      title: "Secret Delivery in Config Management",
      kind: "sequence",
      caption: "Secrets are stored encrypted in a vault, retrieved at runtime by the config management tool, and injected into nodes without appearing in plaintext in version control.",
      mermaid: `sequenceDiagram
    participant Dev as Developer
    participant VCS as Git Repo
    participant Vault as Secret Store
    participant CM as Config Tool
    participant Node as Managed Node

    Dev->>Vault: Store secret encrypted
    Dev->>VCS: Commit encrypted reference
    CM->>VCS: Clone playbook or manifest
    CM->>Vault: Authenticate and fetch secret
    Vault-->>CM: Return plaintext secret
    CM->>Node: Deploy config with injected secret
    Node->>Node: Write to protected file
    Note over Node: Secret never stored in VCS`,
    },
  ],
  animations: [
    {
      title: "Ansible Playbook Execution Lifecycle",
      steps: [
        { label: "Parse inventory", detail: "Ansible reads the inventory file (INI, YAML, or dynamic script) to build the list of target hosts and their group memberships, connection variables, and host-specific variables." },
        { label: "Gather facts", detail: "The `setup` module runs on each target via SSH, collecting system facts (OS, IP addresses, CPU, memory, mounts, network interfaces) that become available as variables throughout the playbook." },
        { label: "Compile tasks", detail: "Each task is compiled into a self-contained Python module script with all variables resolved via Jinja2 templating. Conditionals (`when` clauses) are evaluated to determine whether the task should execute." },
        { label: "Transfer and execute", detail: "The compiled module script is transferred to the remote host over SFTP/SCP, placed in a temporary directory, executed with the appropriate privileges (`become: true` triggers sudo), and the temporary files are cleaned up." },
        { label: "Evaluate results", detail: "The module returns JSON output indicating `changed`, `ok`, `failed`, or `skipped`. If the result is `changed` and the task has a `notify` directive, the named handler is flagged for execution." },
        { label: "Flush handlers", detail: "At the end of the play (or when `meta: flush_handlers` is called), all notified handlers execute in the order they are defined, not the order they were notified. Each handler runs only once regardless of how many tasks notified it." },
        { label: "Report summary", detail: "Ansible prints a play recap showing per-host counts of ok, changed, unreachable, failed, skipped, and rescued tasks. Callback plugins can emit this data to logging systems, Slack, or CI/CD pipelines." },
      ],
    },
  ],
  exercises: [
    "Write an Ansible playbook that installs Docker on Ubuntu, adds a specified user to the `docker` group, and ensures the Docker service is running and enabled. Test it with `--check --diff` before applying.",
    "Create a Puppet module that manages the SSH server: install the `openssh-server` package, deploy a hardened `sshd_config` from a template (disable root login, disable password auth, change the port), and ensure the service restarts when the config changes.",
    "Build a Chef cookbook that sets up a LAMP stack (Apache, MySQL, PHP) with a virtual host configuration. Use attributes for customizable values like the document root and server name.",
    "Set up an Ansible Vault-encrypted variable file to store database credentials. Write a playbook that uses these encrypted credentials to configure a database connection file on target hosts. Verify that the vault file is not readable in plaintext in your repository.",
    "Implement a Molecule test scenario for an Ansible role. The test should spin up a Docker container, apply the role, run Testinfra assertions (check that packages are installed, services are running, config files have correct content), and then destroy the container.",
  ],
  cheatSheet: [
    "`ansible-playbook site.yml -i inventory --limit webservers` -- Run a playbook against a specific group of hosts",
    "`ansible-playbook site.yml --check --diff` -- Dry-run mode: show what would change without applying",
    "`ansible-vault encrypt secrets.yml` -- Encrypt a file with AES-256; `decrypt`, `edit`, `view` also available",
    "`ansible all -m ping -i inventory` -- Ad-hoc command to test connectivity to all hosts in inventory",
    "`puppet agent --test --noop` -- Run Puppet agent in no-op (dry-run) mode to preview changes",
    "`puppet resource package nginx` -- Query the current state of a resource directly from the system",
    "`chef-client --why-run` -- Chef dry-run mode to simulate convergence without making changes",
    "`knife node list` -- List all nodes registered with the Chef Server",
  ],
  revisionNotes: [
    "Configuration management enforces desired state declaratively -- you describe what the system should look like, not the steps to get there.",
    "Ansible is agentless (SSH-based, push model), while Puppet and Chef use agents that pull from a central server on a schedule.",
    "Idempotency is non-negotiable: every module/resource must safely handle repeated application without side effects.",
    "Drift detection (Ansible `--check`, Puppet agent runs, Chef `--why-run`) is critical for maintaining fleet consistency over time.",
    "Secret management must never rely on plaintext in version control -- use Ansible Vault, Hiera eyaml, encrypted data bags, or external vaults like HashiCorp Vault.",
    "Testing pyramid: lint -> unit tests (Molecule, rspec-puppet, ChefSpec) -> integration tests (Test Kitchen, Vagrant) -> staging environment validation.",
    "Roles (Ansible), modules (Puppet), and cookbooks (Chef) are the units of reuse -- keep them single-purpose with parameterized defaults.",
    "Immutable infrastructure (build images, replace instances) is an alternative to mutable config management -- many organizations use a hybrid of both.",
  ],
  resources: [
    { label: "Ansible Documentation", kind: "docs", note: "Official documentation covering modules, playbook syntax, best practices, and the Ansible Galaxy ecosystem." },
    { label: "Puppet Documentation", kind: "docs", note: "Comprehensive reference for Puppet language, resource types, Hiera, PuppetDB, and module development." },
    { label: "Infrastructure as Code by Kief Morris (O'Reilly)", kind: "book", note: "Covers configuration management patterns, immutable infrastructure, and how to manage servers at scale with modern tooling." },
    { label: "Ansible for DevOps by Jeff Geerling", kind: "book", note: "Practical, hands-on guide to Ansible with real-world examples including CI/CD integration, Docker, and Kubernetes." },
    { label: "Test-Driven Infrastructure with Chef (2nd Edition)", kind: "book", note: "Explains testing strategies for infrastructure code including ChefSpec, Test Kitchen, and InSpec." },
  ],
};
