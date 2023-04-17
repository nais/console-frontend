export const naisyaml = {
  "apiVersion": "nais.io/v1alpha1",
  "kind": "Application",
  "metadata": {
    "creationTimestamp": null,
    "labels": {
      "team": "myteam"
    },
    "name": "myapplication",
    "namespace": "myteam"
  },
  "spec": {
    "accessPolicy": {
      "inbound": {
        "rules": [
          {
            "application": "app1"
          },
          {
            "application": "app2",
            "namespace": "q1"
          },
          {
            "application": "app3",
            "cluster": "dev-gcp",
            "namespace": "q2"
          },
          {
            "application": "*",
            "namespace": "q3"
          },
          {
            "application": "app4",
            "permissions": {
              "scopes": [
                "custom-scope"
              ]
            }
          },
          {
            "application": "app5",
            "permissions": {
              "roles": [
                "custom-role"
              ]
            }
          },
          {
            "application": "app6",
            "permissions": {
              "roles": [
                "custom-role"
              ],
              "scopes": [
                "custom-scope"
              ]
            }
          }
        ]
      },
      "outbound": {
        "external": [
          {
            "host": "external-application.example.com"
          },
          {
            "host": "non-http-service.example.com",
            "ports": [
              {
                "name": "kafka",
                "port": 9200,
                "protocol": "TCP"
              }
            ]
          }
        ],
        "rules": [
          {
            "application": "app1"
          },
          {
            "application": "app2",
            "namespace": "q1"
          },
          {
            "application": "app3",
            "cluster": "dev-gcp",
            "namespace": "q2"
          },
          {
            "application": "*",
            "namespace": "q3"
          }
        ]
      }
    },
    "azure": {
      "application": {
        "allowAllUsers": true,
        "claims": {
          "extra": [
            "NAVident",
            "azp_name"
          ],
          "groups": [
            {
              "id": "00000000-0000-0000-0000-000000000000"
            }
          ]
        },
        "enabled": true,
        "replyURLs": [
          "https://myapplication.nav.no/oauth2/callback"
        ],
        "singlePageApplication": true,
        "tenant": "nav.no"
      },
      "sidecar": {
        "autoLogin": true,
        "autoLoginIgnorePaths": [
          "/path",
          "/internal/*"
        ],
        "enabled": true,
        "errorPath": "/error",
        "resources": {
          "limits": {
            "cpu": "250m",
            "memory": "256Mi"
          },
          "requests": {
            "cpu": "20m",
            "memory": "32Mi"
          }
        }
      }
    },
    "command": [
      "/app/myapplication",
      "--param",
      "value",
      "--other-param",
      "other-value"
    ],
    "env": [
      {
        "name": "MY_CUSTOM_VAR",
        "value": "some_value"
      },
      {
        "name": "MY_APPLICATION_NAME",
        "valueFrom": {
          "fieldRef": {
            "fieldPath": "metadata.name"
          }
        }
      }
    ],
    "envFrom": [
      {
        "secret": "my-secret-with-envs"
      },
      {
        "configmap": "my-configmap-with-envs"
      }
    ],
    "filesFrom": [
      {
        "configmap": "example-files-configmap",
        "mountPath": "/var/run/configmaps"
      },
      {
        "mountPath": "/var/run/secrets",
        "secret": "my-secret-file"
      },
      {
        "emptyDir": {
          "medium": "Memory"
        },
        "mountPath": "/var/cache"
      },
      {
        "mountPath": "/var/run/pvc",
        "persistentVolumeClaim": "pvc-name"
      }
    ],
    "gcp": {
      "bigQueryDatasets": [
        {
          "cascadingDelete": true,
          "description": "Contains big data, supporting big queries, for use in big ideas.",
          "name": "my_bigquery_dataset1",
          "permission": "READWRITE"
        },
        {
          "description": "Contains big data, supporting big queries, for use in big ideas.",
          "name": "my_bigquery_dataset2",
          "permission": "READ"
        }
      ],
      "buckets": [
        {
          "cascadingDelete": true,
          "lifecycleCondition": {
            "age": 10,
            "createdBefore": "2020-01-01",
            "numNewerVersions": 2,
            "withState": "ARCHIVED"
          },
          "name": "my-cloud-storage-bucket",
          "publicAccessPrevention": true,
          "retentionPeriodDays": 30,
          "uniformBucketLevelAccess": true
        }
      ],
      "permissions": [
        {
          "resource": {
            "apiVersion": "resourcemanager.cnrm.cloud.google.com/v1beta1",
            "kind": "Project",
            "name": "myteam-dev-ab23"
          },
          "role": "roles/cloudsql.client"
        }
      ],
      "sqlInstances": [
        {
          "autoBackupHour": 1,
          "cascadingDelete": true,
          "collation": "nb_NO.UTF8",
          "databases": [
            {
              "envVarPrefix": "DB",
              "name": "mydatabase",
              "users": [
                {
                  "name": "extra_user"
                }
              ]
            }
          ],
          "diskAutoresize": true,
          "diskSize": 30,
          "diskType": "SSD",
          "flags": [
            {
              "name": "max_connections",
              "value": "50"
            }
          ],
          "highAvailability": true,
          "insights": {
            "enabled": true,
            "queryStringLength": 4500,
            "recordApplicationTags": true,
            "recordClientAddress": true
          },
          "maintenance": {
            "day": 1,
            "hour": 4
          },
          "name": "myinstance",
          "pointInTimeRecovery": true,
          "retainedBackups": 14,
          "tier": "db-f1-micro",
          "type": "POSTGRES_12"
        }
      ]
    },
    "idporten": {
      "accessTokenLifetime": 3600,
      "clientURI": "https://www.nav.no",
      "enabled": true,
      "frontchannelLogoutPath": "/oauth2/logout",
      "integrationType": "idporten",
      "postLogoutRedirectURIs": [
        "https://www.nav.no"
      ],
      "redirectPath": "/oauth2/callback",
      "scopes": [
        "openid",
        "profile"
      ],
      "sessionLifetime": 7200,
      "sidecar": {
        "autoLogin": true,
        "autoLoginIgnorePaths": [
          "/path",
          "/internal/*"
        ],
        "enabled": true,
        "errorPath": "/error",
        "level": "Level4",
        "locale": "nb",
        "resources": {
          "limits": {
            "cpu": "250m",
            "memory": "256Mi"
          },
          "requests": {
            "cpu": "20m",
            "memory": "32Mi"
          }
        }
      }
    },
    "image": "navikt/testapp:69.0.0",
    "influx": {
      "instance": "influx-instance"
    },
    "ingresses": [
      "https://myapplication.nav.no"
    ],
    "kafka": {
      "pool": "nav-dev",
      "streams": true
    },
    "leaderElection": true,
    "liveness": {
      "failureThreshold": 10,
      "initialDelay": 20,
      "path": "/isalive",
      "periodSeconds": 5,
      "port": 8080,
      "timeout": 1
    },
    "logformat": "accesslog_with_referer_useragent",
    "logtransform": "http_loglevel",
    "maskinporten": {
      "enabled": true,
      "scopes": {
        "consumes": [
          {
            "name": "skatt:scope.read"
          }
        ],
        "exposes": [
          {
            "allowedIntegrations": [
              "maskinporten"
            ],
            "atMaxAge": 30,
            "consumers": [
              {
                "name": "KST",
                "orgno": "123456789"
              }
            ],
            "enabled": true,
            "name": "scope.read",
            "product": "arbeid"
          }
        ]
      }
    },
    "openSearch": {
      "access": "readwrite",
      "instance": "my-open-search-instance"
    },
    "port": 8080,
    "preStopHook": {
      "exec": {
        "command": [
          "./my",
          "--shell",
          "script"
        ]
      },
      "http": {
        "path": "/internal/stop",
        "port": 8080
      }
    },
    "preStopHookPath": "/internal/stop",
    "prometheus": {
      "enabled": true,
      "path": "/metrics",
      "port": "8080"
    },
    "readiness": {
      "failureThreshold": 10,
      "initialDelay": 20,
      "path": "/isready",
      "periodSeconds": 5,
      "port": 8080,
      "timeout": 1
    },
    "replicas": {
      "cpuThresholdPercentage": 50,
      "disableAutoScaling": true,
      "max": 4,
      "min": 2
    },
    "resources": {
      "limits": {
        "cpu": "500m",
        "memory": "512Mi"
      },
      "requests": {
        "cpu": "200m",
        "memory": "256Mi"
      }
    },
    "secureLogs": {
      "enabled": true
    },
    "service": {
      "port": 80,
      "protocol": "http"
    },
    "skipCaBundle": true,
    "startup": {
      "failureThreshold": 10,
      "initialDelay": 20,
      "path": "/started",
      "periodSeconds": 5,
      "port": 8080,
      "timeout": 1
    },
    "strategy": {
      "rollingUpdate": {
        "maxSurge": "25%",
        "maxUnavailable": 0
      },
      "type": "RollingUpdate"
    },
    "terminationGracePeriodSeconds": 60,
    "tokenx": {
      "enabled": true,
      "mountSecretsAsFilesOnly": true
    },
    "vault": {
      "enabled": true,
      "paths": [
        {
          "format": "env",
          "kvPath": "/kv/preprod/fss/application/namespace",
          "mountPath": "/var/run/secrets/nais.io/vault"
        }
      ],
      "sidecar": true
    },
    "webproxy": true
  },
  "status": {}
}
