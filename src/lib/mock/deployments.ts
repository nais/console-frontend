export const deployments = [
		{
			deployment: {
				id: '07f3426f-8492-4c93-a940-a41896afd8a5',
				team: 'teampensjon',
				created: '2023-04-17T12:57:01.755646Z',
				githubID: 871343402,
				githubRepository: 'navikt/pesys',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: 'fb06cedd-5167-4c6f-8a0e-c7c9af0829a7',
					deploymentID: '07f3426f-8492-4c93-a940-a41896afd8a5',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:57:02.503539Z'
				},
				{
					id: 'cc239211-d4e5-477e-831e-7acfbc14dcbe',
					deploymentID: '07f3426f-8492-4c93-a940-a41896afd8a5',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=teampensjon, Name=pensjon-pselv-q0',
					created: '2023-04-17T12:57:02.503512Z'
				},
				{
					id: '9496903b-8404-4c3f-8b65-bbc3e234dfe1',
					deploymentID: '07f3426f-8492-4c93-a940-a41896afd8a5',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:57:02.045115Z'
				}
			],
			resources: [
				{
					id: '7a7f7dda-4af3-4386-85ca-2b9783a0acc7',
					deploymentID: '07f3426f-8492-4c93-a940-a41896afd8a5',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'pensjon-pselv-q0',
					namespace: 'teampensjon'
				}
			]
		},
		{
			deployment: {
				id: '8ed223fb-feeb-4f02-a028-7e3413111f0c',
				team: 'teampensjon',
				created: '2023-04-17T12:56:59.633092Z',
				githubID: 871343346,
				githubRepository: 'navikt/pesys',
				cluster: 'dev-fss',
				state: null
			},
			statuses: [
				{
					id: '786d5671-4bc3-43cd-84ff-c5d27b0bfe01',
					deploymentID: '8ed223fb-feeb-4f02-a028-7e3413111f0c',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:57:00.181508Z'
				},
				{
					id: '94d6e6f9-a318-44db-b304-fa4aa1d34801',
					deploymentID: '8ed223fb-feeb-4f02-a028-7e3413111f0c',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=teampensjon, Name=pensjon-psak-q0',
					created: '2023-04-17T12:57:00.181497Z'
				},
				{
					id: '52483bb8-082b-466e-8e85-d2bd40d07c92',
					deploymentID: '8ed223fb-feeb-4f02-a028-7e3413111f0c',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:57:00.0365Z'
				}
			],
			resources: [
				{
					id: 'a00af914-6772-4970-86fe-31727ddd99e4',
					deploymentID: '8ed223fb-feeb-4f02-a028-7e3413111f0c',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'pensjon-psak-q0',
					namespace: 'teampensjon'
				}
			]
		},
		{
			deployment: {
				id: '7b11deef-a31d-4783-a314-17923d6f4d4b',
				team: 'teampensjon',
				created: '2023-04-17T12:56:58.584291Z',
				githubID: 871343299,
				githubRepository: 'navikt/pesys',
				cluster: 'dev-fss',
				state: null
			},
			statuses: [
				{
					id: '0beb9413-a947-438a-ab08-bdbc479d77ae',
					deploymentID: '7b11deef-a31d-4783-a314-17923d6f4d4b',
					status: 'in_progress',
					message:
						'Application/pensjon-pselv-q0 (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:57:01.740031Z'
				},
				{
					id: '740e4831-ee46-4f3e-9802-2b9a9d9ad550',
					deploymentID: '7b11deef-a31d-4783-a314-17923d6f4d4b',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pselv-q0 (ScalingReplicaSet): Scaled up replica set pensjon-pselv-q0-b54b445b4 to 1',
					created: '2023-04-17T12:57:01.652661Z'
				},
				{
					id: '2b293135-d57b-4e96-80f7-46511de6d104',
					deploymentID: '7b11deef-a31d-4783-a314-17923d6f4d4b',
					status: 'in_progress',
					message:
						'AzureAdApplication/pensjon-pselv-q0 (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:57:01.253668Z'
				},
				{
					id: 'df41e217-a0fa-47f8-bb02-25045a00dae7',
					deploymentID: '7b11deef-a31d-4783-a314-17923d6f4d4b',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:56:58.880012Z'
				},
				{
					id: '172ad5eb-8984-4b1d-a508-54aab47cf0a4',
					deploymentID: '7b11deef-a31d-4783-a314-17923d6f4d4b',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=teampensjon, Name=pensjon-pselv-q0',
					created: '2023-04-17T12:56:58.879997Z'
				},
				{
					id: '95a56d25-d8f3-4b07-bd5a-4af1f1a58892',
					deploymentID: '7b11deef-a31d-4783-a314-17923d6f4d4b',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:56:58.779183Z'
				}
			],
			resources: [
				{
					id: '8c2a88fe-3b36-4f00-81fd-00da9e73295a',
					deploymentID: '7b11deef-a31d-4783-a314-17923d6f4d4b',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'pensjon-pselv-q0',
					namespace: 'teampensjon'
				}
			]
		},
		{
			deployment: {
				id: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
				team: 'teamfrikort',
				created: '2023-04-17T12:56:43.586996Z',
				githubID: 871342932,
				githubRepository: 'navikt/frikort-utbetaling',
				cluster: 'prod-fss',
				state: null
			},
			statuses: [
				{
					id: 'a53cd116-5da0-4bb9-9c75-b24d0aecbef0',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message: 'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Started): Started container elector',
					created: '2023-04-17T12:56:54.059459Z'
				},
				{
					id: '3e5cd498-339e-4342-8cbb-f563ecec73b1',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message: 'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Created): Created container elector',
					created: '2023-04-17T12:56:53.971052Z'
				},
				{
					id: 'b7430be6-0bda-4026-82f8-6a16fcc124e8',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/elector:20230310-120406-3b3cc7d" already present on machine',
					created: '2023-04-17T12:56:53.962491Z'
				},
				{
					id: '7ea6e642-7e2e-4e46-93d3-ef564e7245a1',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Started): Started container frikortutbetaling',
					created: '2023-04-17T12:56:53.957808Z'
				},
				{
					id: 'bc603418-e5bd-428b-919b-342c2ad50b42',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Created): Created container frikortutbetaling',
					created: '2023-04-17T12:56:53.874269Z'
				},
				{
					id: 'd81e1a0b-d916-4ee6-a6d4-ba9a5b5b4651',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Pulled): Successfully pulled image "ghcr.io/navikt/frikort-utbetaling/frikortutbetaling:1.2.48" in 6.625052069s',
					created: '2023-04-17T12:56:53.790483Z'
				},
				{
					id: '87e366ae-cc10-4281-b088-994409d19bb9',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Pulling): Pulling image "ghcr.io/navikt/frikort-utbetaling/frikortutbetaling:1.2.48"',
					created: '2023-04-17T12:56:47.166012Z'
				},
				{
					id: '52c7ac11-9c71-4e26-8a32-0e7dc9c0b14f',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message: 'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Started): Started container vks-init',
					created: '2023-04-17T12:56:46.526322Z'
				},
				{
					id: '7431d588-fb3f-4431-980c-256ff48ff611',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message: 'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Created): Created container vks-init',
					created: '2023-04-17T12:56:46.445082Z'
				},
				{
					id: '63b8eb7d-55c5-4a4c-95e2-e60a51d7c99f',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Pod/frikortutbetaling-7f68b8b8d8-4mm9b (Pulled): Container image "docker.io/navikt/vault-sidekick:v0.3.10-26ad67d" already present on machine',
					created: '2023-04-17T12:56:46.402213Z'
				},
				{
					id: 'b6d8d7b1-2831-4f59-9578-ff33cfac5aec',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'ReplicaSet/frikortutbetaling-7f68b8b8d8 (SuccessfulCreate): Created pod: frikortutbetaling-7f68b8b8d8-4mm9b',
					created: '2023-04-17T12:56:45.951285Z'
				},
				{
					id: 'c36c9d60-6c79-4ccb-8b0f-f02030ab02a9',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Application/frikortutbetaling (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:56:45.519498Z'
				},
				{
					id: 'b28b65cb-c97c-4abb-b0e9-6982887e08ee',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Deployment/frikortutbetaling (ScalingReplicaSet): Scaled up replica set frikortutbetaling-7f68b8b8d8 to 1',
					created: '2023-04-17T12:56:45.504479Z'
				},
				{
					id: 'f7ef8ef4-5dd8-476d-b572-f14cfda58233',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:56:44.011812Z'
				},
				{
					id: '47ab834f-0afb-43d8-b11a-cbd113c30b6c',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=teamfrikort, Name=frikortutbetaling',
					created: '2023-04-17T12:56:44.011801Z'
				},
				{
					id: 'c17a4b79-5f0b-4ccf-b885-b1a39eeb0d60',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:56:43.913297Z'
				}
			],
			resources: [
				{
					id: '7580dc7c-ddc0-4c4e-96e2-5cb0fb765601',
					deploymentID: '460bb7fc-f0ff-4f82-a7ff-fa8757bf6f6c',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'frikortutbetaling',
					namespace: 'teamfrikort'
				}
			]
		},
		{
			deployment: {
				id: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
				team: 'arbeidsgiver',
				created: '2023-04-17T12:56:27.173636Z',
				githubID: 871342554,
				githubRepository: 'navikt/tiltak-refusjon-arbeidsgiver',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '77bd2428-8e77-4463-acb6-033b6c5edeed',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					status: 'in_progress',
					message:
						'ServiceAccount/tiltak-refusjon-arbeidsgiver-labs (IssuedLeafCertificate): issued certificate for tiltak-refusjon-arbeidsgiver-labs.arbeidsgiver.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:56 +0000 UTC: 901f232dbc1fba2d6ddb7bba0c74aa11',
					created: '2023-04-17T12:56:36.938366Z'
				},
				{
					id: '3b707766-6fa9-415e-8900-5f6e3cbbc0b9',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver-labs (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:56:29.530619Z'
				},
				{
					id: '2c302d55-9262-46c3-a73a-3926df608b36',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver-labs (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:56:29.43602Z'
				},
				{
					id: '41af02bf-f1be-4274-af93-8ebfff0f84f5',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver-labs (ScalingReplicaSet): Scaled up replica set tiltak-refusjon-arbeidsgiver-labs-c85c4bb4 to 1',
					created: '2023-04-17T12:56:29.433358Z'
				},
				{
					id: '4ea03e7b-985f-4590-8f72-6fea253d2c69',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:56:28.072757Z'
				},
				{
					id: '452fa742-a362-460b-a287-30166c0626ac',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=arbeidsgiver, Name=tiltak-refusjon-arbeidsgiver-labs',
					created: '2023-04-17T12:56:28.072736Z'
				},
				{
					id: '04c31c49-a589-4c08-8e05-6762c40f4796',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:56:27.44066Z'
				}
			],
			resources: [
				{
					id: '3f01bd2d-a146-4736-ac48-95179a5813e6',
					deploymentID: 'ee86dafe-a593-41ac-aa57-81a9bea54bc9',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'tiltak-refusjon-arbeidsgiver-labs',
					namespace: 'arbeidsgiver'
				}
			]
		},
		{
			deployment: {
				id: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
				team: 'arbeidsgiver',
				created: '2023-04-17T12:56:27.134248Z',
				githubID: 871342522,
				githubRepository: 'navikt/tiltak-refusjon-arbeidsgiver',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '4521c409-5aed-40ea-8117-cfa258bb4023',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (ScalingReplicaSet): Scaled down replica set tiltak-refusjon-arbeidsgiver-c6db57dff to 0',
					created: '2023-04-17T12:57:02.140098Z'
				},
				{
					id: 'd61f9130-5153-4b10-951c-0d2b6ff85958',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'ServiceAccount/tiltak-refusjon-arbeidsgiver (IssuedLeafCertificate): issued certificate for tiltak-refusjon-arbeidsgiver.arbeidsgiver.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:59 +0000 UTC: f8edfdb456119316349a863890580721',
					created: '2023-04-17T12:56:39.125938Z'
				},
				{
					id: 'eec7e62d-1d51-4cc8-814a-0bbb71abf3c7',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver-redis (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:56:35.097203Z'
				},
				{
					id: '04dcdcc7-ab0b-4ee4-b869-5cf12f7e50ed',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:56:31.11064Z'
				},
				{
					id: '5ced66b6-b75f-4809-899a-f643b4e3034f',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:56:31.095254Z'
				},
				{
					id: '73c5ee7a-bc12-4634-b40e-eb8124a4cf41',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (ScalingReplicaSet): Scaled up replica set tiltak-refusjon-arbeidsgiver-fcd976d79 to 1',
					created: '2023-04-17T12:56:30.971526Z'
				},
				{
					id: 'dbd864e1-28e5-43af-8162-f557bf267723',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'IDPortenClient/tiltak-refusjon-arbeidsgiver (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:56:30.409953Z'
				},
				{
					id: 'cdc6dd15-fea3-4e3b-b2fe-41dc5740ab85',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver-redis (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:56:29.931312Z'
				},
				{
					id: 'd4816220-0546-4ead-b43d-ed2d98fa4860',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:56:28.781316Z'
				},
				{
					id: '11ab7362-01dd-4b8a-818a-c3e23c1fbe12',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=arbeidsgiver, Name=tiltak-refusjon-arbeidsgiver',
					created: '2023-04-17T12:56:28.781308Z'
				},
				{
					id: '56e3aec0-4410-4c53-b9e1-08b32ad50685',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=arbeidsgiver, Name=tiltak-refusjon-arbeidsgiver-redis',
					created: '2023-04-17T12:56:28.132979Z'
				},
				{
					id: '0d6e6bcb-3d11-4d49-b348-d018e2fbcb89',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:56:27.439024Z'
				}
			],
			resources: [
				{
					id: 'fb50c926-f627-4166-bcf3-0c413c533d3d',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'tiltak-refusjon-arbeidsgiver-redis',
					namespace: 'arbeidsgiver'
				},
				{
					id: '38ce283c-228a-46c6-8a74-6fa03e183c9e',
					deploymentID: 'dd82aa1e-ce4b-4890-856f-387d8c56b882',
					index: 1,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'tiltak-refusjon-arbeidsgiver',
					namespace: 'arbeidsgiver'
				}
			]
		},
		{
			deployment: {
				id: '0bf35050-cecc-4f99-b99f-fbe372240650',
				team: 'helsearbeidsgiver',
				created: '2023-04-17T12:55:57.132914Z',
				githubID: 871341811,
				githubRepository: 'navikt/spinntektsmelding-frontend',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '49046d27-7a3c-4e07-a9b2-48fa2659101a',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:56:34.503952Z'
				},
				{
					id: 'a3c3c3f5-6074-4a5c-b7f1-683d4b37b967',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Application/spinntektsmelding-frontend (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:56:34.503757Z'
				},
				{
					id: '77fe8161-5376-47cc-bee9-03f770e0f67b',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-5855796bb4-lj9l5 (Killing): Stopping container wonderwall',
					created: '2023-04-17T12:56:30.971919Z'
				},
				{
					id: '9869fca2-7f85-4bc3-a84d-b3a984274bd5',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-5855796bb4-lj9l5 (Killing): Stopping container spinntektsmelding-frontend',
					created: '2023-04-17T12:56:30.965013Z'
				},
				{
					id: '4c91fd2e-3c83-4482-b4e3-87bb456f7883',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-5855796bb4-lj9l5 (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:56:30.953806Z'
				},
				{
					id: '8764c26c-b2ff-4c2b-8529-5a6c88bdad9d',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'ReplicaSet/spinntektsmelding-frontend-5855796bb4 (SuccessfulDelete): Deleted pod: spinntektsmelding-frontend-5855796bb4-lj9l5',
					created: '2023-04-17T12:56:30.945733Z'
				},
				{
					id: 'bdf78398-1aaf-49bf-8e58-f1aa2768edc4',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Deployment/spinntektsmelding-frontend (ScalingReplicaSet): Scaled down replica set spinntektsmelding-frontend-5855796bb4 to 0',
					created: '2023-04-17T12:56:30.622366Z'
				},
				{
					id: 'df8b526c-935a-49bc-b1a6-248fd5d13419',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'ServiceAccount/spinntektsmelding-frontend (IssuedLeafCertificate): issued certificate for spinntektsmelding-frontend.helsearbeidsgiver.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:27 +0000 UTC: a91074325dddf43c5a6b56d8e230e88a',
					created: '2023-04-17T12:56:07.420157Z'
				},
				{
					id: '4930aeb7-4101-4d40-89ae-7fbff782a8f6',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Deployment/spinntektsmelding-frontend (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:55:59.430599Z'
				},
				{
					id: '7f9c2e45-eec4-44da-8797-7677eba80fb5',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Application/spinntektsmelding-frontend (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:59.294454Z'
				},
				{
					id: '2b650975-d5af-4b59-a693-b920b71d9301',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Deployment/spinntektsmelding-frontend (ScalingReplicaSet): Scaled up replica set spinntektsmelding-frontend-cb8b4ffdd to 1',
					created: '2023-04-17T12:55:59.181272Z'
				},
				{
					id: '317ac1d5-c952-4d38-bdee-6f6f3456f38a',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:57.688479Z'
				},
				{
					id: '52492eda-75dc-4cc5-a15a-f680dc13780a',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=helsearbeidsgiver, Name=spinntektsmelding-frontend',
					created: '2023-04-17T12:55:57.688458Z'
				},
				{
					id: '7598d4d2-e1e2-4be2-bdd3-84774dac19f1',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:57.32511Z'
				}
			],
			resources: [
				{
					id: 'ee37b89b-4576-426d-808d-78374a7c6615',
					deploymentID: '0bf35050-cecc-4f99-b99f-fbe372240650',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'spinntektsmelding-frontend',
					namespace: 'helsearbeidsgiver'
				}
			]
		},
		{
			deployment: {
				id: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
				team: 'helsearbeidsgiver',
				created: '2023-04-17T12:55:54.149604Z',
				githubID: 871341759,
				githubRepository: 'navikt/spinntektsmelding-frontend',
				cluster: 'prod-gcp',
				state: null
			},
			statuses: [
				{
					id: 'b960b4c5-d87f-423b-84af-8c5d118956a5',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:56:30.953035Z'
				},
				{
					id: '15c01af8-5fdc-4a44-9116-8923235b6454',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Application/spinntektsmelding-frontend (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:56:30.952872Z'
				},
				{
					id: '6c9b283b-bd31-4047-8eed-c50b104cfe0a',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Started): Started container wonderwall',
					created: '2023-04-17T12:56:14.496235Z'
				},
				{
					id: '3c3bbe80-701d-4bd7-a070-d0600043c4a0',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Created): Created container wonderwall',
					created: '2023-04-17T12:56:14.063091Z'
				},
				{
					id: '18567de4-74e6-49c0-b6bd-c6be75047c82',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/wonderwall:2022-12-19-4291de3" already present on machine',
					created: '2023-04-17T12:56:14.012745Z'
				},
				{
					id: 'e5fc1ca1-84df-47e9-a49a-78fd3ffb0177',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Started): Started container spinntektsmelding-frontend',
					created: '2023-04-17T12:56:14.008013Z'
				},
				{
					id: '407f2e80-dcf0-4598-9e63-9e5ae59b6d39',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Created): Created container spinntektsmelding-frontend',
					created: '2023-04-17T12:56:13.517544Z'
				},
				{
					id: '1bcd716a-a10b-4f0f-bb60-88bb777b4dab',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Pulled): Successfully pulled image "ghcr.io/navikt/spinntektsmelding-frontend/spinntektsmelding-frontend:911ef895a46a4e35b4e7b8fd75440dda51bba934" in 3.87407071s',
					created: '2023-04-17T12:56:13.452813Z'
				},
				{
					id: 'fdbbe394-423c-4ffd-9ae4-903efc811930',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Pulling): Pulling image "ghcr.io/navikt/spinntektsmelding-frontend/spinntektsmelding-frontend:911ef895a46a4e35b4e7b8fd75440dda51bba934"',
					created: '2023-04-17T12:56:09.578342Z'
				},
				{
					id: '686f2a7d-102e-4589-98b2-e5014ce4408a',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'ServiceAccount/spinntektsmelding-frontend (IssuedLeafCertificate): issued certificate for spinntektsmelding-frontend.helsearbeidsgiver.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:27 +0000 UTC: f3a7a9dfd87eb6917ae533c3d3332fd6',
					created: '2023-04-17T12:56:07.978339Z'
				},
				{
					id: 'a34a16fe-c9b6-4122-a5da-d67a1f9642db',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:56:07.80537Z'
				},
				{
					id: 'a0957c31-efa6-4c03-b674-0164ce46fbed',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:56:06.101665Z'
				},
				{
					id: '44a678eb-307e-40d2-9856-4687f248d8a9',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:56:06.058232Z'
				},
				{
					id: 'cd28da9e-78db-41f6-8205-05a25aba5147',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Started): Started container linkerd-init',
					created: '2023-04-17T12:56:05.205016Z'
				},
				{
					id: '69c490a5-1807-4dbc-ba46-ab5cd1b37c55',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Created): Created container linkerd-init',
					created: '2023-04-17T12:56:01.249653Z'
				},
				{
					id: 'f22bccdd-3e83-499d-8f87-d5856cde7e56',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:56:01.210534Z'
				},
				{
					id: '98fb1a3b-4965-48a9-95f7-af0f460aad8a',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message: 'IDPortenClient/spinntektsmelding-frontend (Synchronized): Client is up-to-date',
					created: '2023-04-17T12:55:58.723148Z'
				},
				{
					id: '4e61138e-20d0-4fb4-8c91-66920798bf13',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'IDPortenClient/spinntektsmelding-frontend (RotatedInDigDir): Client credentials is rotated',
					created: '2023-04-17T12:55:58.669502Z'
				},
				{
					id: 'b9e1dec4-eb1e-405f-94b6-5b2d238f50bf',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (FailedMount): MountVolume.SetUp failed for volume "idporten-spinntektsmelding-frontend-ac4b6673" : secret "idporten-spinntektsmelding-frontend-ac4b6673" not found',
					created: '2023-04-17T12:55:58.391753Z'
				},
				{
					id: '4b7a8201-e51c-4f14-8742-e6c80ee00888',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'IDPortenClient/spinntektsmelding-frontend (CreatedInDigDir): Client is registered',
					created: '2023-04-17T12:55:57.644542Z'
				},
				{
					id: '71fe65f0-7cc0-44ee-9998-6c52173141b2',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (FailedMount): MountVolume.SetUp failed for volume "idporten-spinntektsmelding-frontend-ac4b6673" : secret "idporten-spinntektsmelding-frontend-ac4b6673" not found',
					created: '2023-04-17T12:55:57.380742Z'
				},
				{
					id: '496d00ac-429a-4726-9193-6a954d5f538d',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (FailedMount): MountVolume.SetUp failed for volume "idporten-spinntektsmelding-frontend-ac4b6673" : secret "idporten-spinntektsmelding-frontend-ac4b6673" not found',
					created: '2023-04-17T12:55:56.871548Z'
				},
				{
					id: 'f752bffb-5596-4295-904d-b3f527d02652',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Pod/spinntektsmelding-frontend-674774c465-2822v (Scheduled): Successfully assigned helsearbeidsgiver/spinntektsmelding-frontend-674774c465-2822v to gke-prod-gcp-nais-pool-cd-2-34e9f59b-2vtr',
					created: '2023-04-17T12:55:56.683952Z'
				},
				{
					id: '099b4e68-1399-4be3-b070-61b8a0d95fdf',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'ReplicaSet/spinntektsmelding-frontend-674774c465 (SuccessfulCreate): Created pod: spinntektsmelding-frontend-674774c465-2822v',
					created: '2023-04-17T12:55:56.672594Z'
				},
				{
					id: 'b310e3d6-b4fa-4178-9947-c62242fbb178',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Deployment/spinntektsmelding-frontend (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:55:55.916351Z'
				},
				{
					id: '622b077e-a653-41fc-9edc-e522069412e5',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Application/spinntektsmelding-frontend (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:55.7691Z'
				},
				{
					id: 'f81e760c-fb54-49e5-8130-a50fc4c7f79a',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Deployment/spinntektsmelding-frontend (ScalingReplicaSet): Scaled up replica set spinntektsmelding-frontend-674774c465 to 1',
					created: '2023-04-17T12:55:55.667512Z'
				},
				{
					id: 'a973bc22-92b7-488a-9c21-8c5319aaec01',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'IDPortenClient/spinntektsmelding-frontend (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:55:55.146346Z'
				},
				{
					id: '40129b1d-4f9f-4ac7-b989-b9341b8a2726',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:54.68634Z'
				},
				{
					id: '62f50c7e-a3f0-4a5e-9237-538cf6d61ced',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=helsearbeidsgiver, Name=spinntektsmelding-frontend',
					created: '2023-04-17T12:55:54.686289Z'
				},
				{
					id: '7b637fe2-4f35-4503-8818-7779a139dc8f',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:54.360038Z'
				}
			],
			resources: [
				{
					id: 'cc8c679b-fefe-4fbf-88c6-1bc1f3a9c420',
					deploymentID: 'dcafa848-afa5-4051-ae00-1dd7ffbce342',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'spinntektsmelding-frontend',
					namespace: 'helsearbeidsgiver'
				}
			]
		},
		{
			deployment: {
				id: 'd54302f9-629a-416c-aa53-ccd566901644',
				team: 'teamsykefravr',
				created: '2023-04-17T12:55:37.447615Z',
				githubID: 871341489,
				githubRepository: 'navikt/syfomodiaperson',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '0a76d93f-f5fb-433f-bf4d-852dd0a3a852',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:57:02.43129Z'
				},
				{
					id: 'b307f7cc-23a8-4539-9c87-47cb4afa74b5',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-689d7c7bfd-8287c (Unhealthy): Readiness probe failed: Get "http://10.6.89.254:8080/health/isReady": dial tcp 10.6.89.254:8080: connect: connection refused',
					created: '2023-04-17T12:56:59.119425Z'
				},
				{
					id: 'be112ad6-f36e-4b81-bccc-f284ea2c3741',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-689d7c7bfd-8287c (Unhealthy): Readiness probe failed: Get "http://10.6.89.254:8080/health/isReady": dial tcp 10.6.89.254:8080: connect: connection refused',
					created: '2023-04-17T12:56:54.122708Z'
				},
				{
					id: '486d59f8-24f9-4485-976a-71d850690a2a',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-689d7c7bfd-8287c (Unhealthy): Readiness probe failed: Get "http://10.6.89.254:4191/ready": dial tcp 10.6.89.254:4191: connect: connection refused',
					created: '2023-04-17T12:56:54.113214Z'
				},
				{
					id: 'e9ef4932-889e-4317-8e79-7c25a8873539',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Started): Started container syfomodiaperson',
					created: '2023-04-17T12:56:49.377032Z'
				},
				{
					id: 'd70046f9-e32f-41e9-86fe-040c79d20c11',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-689d7c7bfd-8287c (Unhealthy): Readiness probe failed: Get "http://10.6.89.254:8080/health/isReady": dial tcp 10.6.89.254:8080: connect: connection refused',
					created: '2023-04-17T12:56:49.112832Z'
				},
				{
					id: '5148498b-d594-414a-96e5-3c5ffb753723',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Created): Created container syfomodiaperson',
					created: '2023-04-17T12:56:48.248595Z'
				},
				{
					id: 'd9da0640-b2b5-4b81-8185-75265002180c',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Pulled): Successfully pulled image "europe-north1-docker.pkg.dev/nais-management-233d/teamsykefravr/syfomodiaperson:2023.04.17-12.53-29b173b" in 1.4744814s',
					created: '2023-04-17T12:56:48.194616Z'
				},
				{
					id: '53f59e44-4cd8-4193-9bf2-db7dd834ed7e',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Pulling): Pulling image "europe-north1-docker.pkg.dev/nais-management-233d/teamsykefravr/syfomodiaperson:2023.04.17-12.53-29b173b"',
					created: '2023-04-17T12:56:46.72611Z'
				},
				{
					id: 'b418b96a-38d4-45fe-b2c2-f78cd5811ece',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'ServiceAccount/syfomodiaperson (IssuedLeafCertificate): issued certificate for syfomodiaperson.teamsykefravr.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:57:04 +0000 UTC: e557e0f4d03a2ec45dc3fdf3a0b7d671',
					created: '2023-04-17T12:56:44.8137Z'
				},
				{
					id: '19d2d631-0791-460d-bc3c-d05340a72207',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:56:44.662614Z'
				},
				{
					id: '4f0d3eed-c7e2-4a6c-9d5f-8cb42a121502',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:56:42.624596Z'
				},
				{
					id: 'bc466563-5ef4-4d63-90f1-252b941bf0da',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:56:42.591505Z'
				},
				{
					id: 'a9cd7c9f-0936-49c5-a265-0f540cb35d74',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Started): Started container linkerd-init',
					created: '2023-04-17T12:56:42.050193Z'
				},
				{
					id: '79b77a33-948d-4d10-9c15-d492782a3adb',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Created): Created container linkerd-init',
					created: '2023-04-17T12:56:38.129113Z'
				},
				{
					id: '09410531-b56d-4687-a9f4-3b3c8225fccd',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:56:38.098671Z'
				},
				{
					id: '4d01c12c-3908-4641-b6ad-e05fc2b7b613',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-ttrf9 (Scheduled): Successfully assigned teamsykefravr/syfomodiaperson-59df47c4d6-ttrf9 to gke-dev-gcp-nais-pod-spot-gar-5f4b0230-f8vq',
					created: '2023-04-17T12:56:36.968031Z'
				},
				{
					id: '12e6bb66-121c-470e-8843-22af8d19c9b3',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'ReplicaSet/syfomodiaperson-59df47c4d6 (SuccessfulCreate): Created pod: syfomodiaperson-59df47c4d6-ttrf9',
					created: '2023-04-17T12:56:36.955627Z'
				},
				{
					id: '376f77ad-2da5-4e48-86f3-7d54ddf78806',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-689d7c7bfd-8287c (Killing): Stopping container syfomodiaperson',
					created: '2023-04-17T12:56:36.31352Z'
				},
				{
					id: '7b5fe5b1-7641-495f-abf7-91e967fcee3f',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-689d7c7bfd-8287c (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:56:36.307451Z'
				},
				{
					id: '22705496-ff30-4a23-80cd-80997189c93f',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'ReplicaSet/syfomodiaperson-689d7c7bfd (SuccessfulDelete): Deleted pod: syfomodiaperson-689d7c7bfd-8287c',
					created: '2023-04-17T12:56:36.301208Z'
				},
				{
					id: 'c227e276-2050-4f00-a196-71368b19b4ed',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'Deployment/syfomodiaperson (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:56:36.210226Z'
				},
				{
					id: '91471e09-daa8-4e62-bba1-0b6403bd9359',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Deployment/syfomodiaperson (ScalingReplicaSet): Scaled up replica set syfomodiaperson-59df47c4d6 to 2',
					created: '2023-04-17T12:56:36.027009Z'
				},
				{
					id: 'dd08672d-4351-445f-92e8-391f8ea94466',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Deployment/syfomodiaperson (ScalingReplicaSet): Scaled down replica set syfomodiaperson-689d7c7bfd to 1',
					created: '2023-04-17T12:56:35.983351Z'
				},
				{
					id: '03095860-b575-4efe-a4e5-66c5ee3be535',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:30.912898Z'
				},
				{
					id: 'eedf9e71-3dc6-40c0-a518-c09dcf6c7e58',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:30.907945Z'
				},
				{
					id: '56bbcaab-9de9-4144-b538-ac4c35ec38f7',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:25.907983Z'
				},
				{
					id: 'fe696afc-d84d-4cc7-8a4e-343de1533f8e',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:20.903892Z'
				},
				{
					id: '7223fe06-7976-4754-96fe-add57c4c4b27',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Started): Started container syfomodiaperson',
					created: '2023-04-17T12:56:10.556137Z'
				},
				{
					id: 'bc66137b-f3e1-45bb-ba1d-c6176b7b6f9a',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Created): Created container syfomodiaperson',
					created: '2023-04-17T12:56:09.584867Z'
				},
				{
					id: 'd421ac7f-9af0-4700-8747-679b35183738',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Pulled): Successfully pulled image "europe-north1-docker.pkg.dev/nais-management-233d/teamsykefravr/syfomodiaperson:2023.04.17-12.53-29b173b" in 19.577053125s',
					created: '2023-04-17T12:56:09.516373Z'
				},
				{
					id: 'fa71782c-7275-4fb4-a3fe-1d79186a1889',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Pulling): Pulling image "europe-north1-docker.pkg.dev/nais-management-233d/teamsykefravr/syfomodiaperson:2023.04.17-12.53-29b173b"',
					created: '2023-04-17T12:55:49.93913Z'
				},
				{
					id: 'f641a0a0-5dfb-452d-ba41-7175d833594c',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'ServiceAccount/syfomodiaperson (IssuedLeafCertificate): issued certificate for syfomodiaperson.teamsykefravr.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:08 +0000 UTC: d53046f517ce7b786c6c15fe07922cc0',
					created: '2023-04-17T12:55:48.250349Z'
				},
				{
					id: 'f6723062-2591-4b39-96f1-a858eec0edcd',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:55:48.073053Z'
				},
				{
					id: '924dd3ec-142b-4778-b0a7-f71a5557245f',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:55:46.256715Z'
				},
				{
					id: '0fbadb83-f54e-4a4d-81c5-726a019f4597',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:55:46.211138Z'
				},
				{
					id: '14e87fdc-709e-46c6-a389-5f91ea48c7b2',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'Pod/syfomodiaperson-59df47c4d6-kvz2x (Started): Started container linkerd-init',
					created: '2023-04-17T12:55:45.438361Z'
				},
				{
					id: '7ff2a12d-c923-4251-ab08-9468113bea52',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'Pod/syfomodiaperson-59df47c4d6-kvz2x (Created): Created container linkerd-init',
					created: '2023-04-17T12:55:41.740432Z'
				},
				{
					id: 'd4635f8e-9efb-48c6-9872-dd846f477665',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:55:41.703953Z'
				},
				{
					id: 'b3927cfa-ca9d-4c98-a9f7-1fe333d619e8',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Pod/syfomodiaperson-59df47c4d6-kvz2x (Scheduled): Successfully assigned teamsykefravr/syfomodiaperson-59df47c4d6-kvz2x to gke-dev-gcp-nais-pod-spot-gar-0b6a67e1-wtwm',
					created: '2023-04-17T12:55:40.569408Z'
				},
				{
					id: '0d21a509-e0e3-429e-940f-5d6be8d142c5',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'ReplicaSet/syfomodiaperson-59df47c4d6 (SuccessfulCreate): Created pod: syfomodiaperson-59df47c4d6-kvz2x',
					created: '2023-04-17T12:55:40.56229Z'
				},
				{
					id: '2f211f39-6e79-4df3-9869-c50117461875',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'Deployment/syfomodiaperson (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:55:39.819975Z'
				},
				{
					id: 'd3267b02-2ab5-4262-aee7-f53115a98dfc',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Application/syfomodiaperson (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:39.739453Z'
				},
				{
					id: 'b1d65f5c-d51c-4977-b76d-7932ae151af0',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Deployment/syfomodiaperson (ScalingReplicaSet): Scaled up replica set syfomodiaperson-59df47c4d6 to 1',
					created: '2023-04-17T12:55:39.615507Z'
				},
				{
					id: '4978b398-9cbc-446e-b315-5215a8732905',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'AzureAdApplication/syfomodiaperson (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:55:39.224289Z'
				},
				{
					id: '6622ef55-9545-4cd6-996e-56db9bb938f9',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:38.110532Z'
				},
				{
					id: '0600a4ed-ebc4-4431-9a64-402c0e73cfce',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=teamsykefravr, Name=syfomodiaperson',
					created: '2023-04-17T12:55:38.110511Z'
				},
				{
					id: 'ba4a4885-5e98-4dad-9410-d1f89b51af21',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:37.730775Z'
				}
			],
			resources: [
				{
					id: '189e71e3-08fb-4332-817f-cd79e86c49dc',
					deploymentID: 'd54302f9-629a-416c-aa53-ccd566901644',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'syfomodiaperson',
					namespace: 'teamsykefravr'
				}
			]
		},
		{
			deployment: {
				id: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
				team: 'team-nof',
				created: '2023-04-17T12:55:34.646194Z',
				githubID: 871341442,
				githubRepository: 'navikt/fullmaktsregister',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '44a381a6-87fb-455f-b7df-ffb922691c96',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-6brcx (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:57:01.873352Z'
				},
				{
					id: 'f1ba3d0f-2ac6-4b0f-9927-46733554df3e',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-6brcx (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:57:01.834665Z'
				},
				{
					id: '8c8afc67-9ef3-4dae-b1f0-1c2fb247c677',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-6brcx (Started): Started container linkerd-init',
					created: '2023-04-17T12:57:01.217746Z'
				},
				{
					id: '3ad91177-c2b8-42b3-a791-27e7ff265422',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-6brcx (Created): Created container linkerd-init',
					created: '2023-04-17T12:56:57.802039Z'
				},
				{
					id: 'ebc95306-7587-467e-bc8f-0a0d804b508f',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-6brcx (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:56:57.771899Z'
				},
				{
					id: 'd7726c22-f844-44cf-8db3-e96d7ff05419',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-6brcx (Scheduled): Successfully assigned team-nof/fullmaktsregister-api-74cd855db8-6brcx to gke-dev-gcp-nais-pod-spot-gar-0b6a67e1-mc6m',
					created: '2023-04-17T12:56:56.835321Z'
				},
				{
					id: '739f2fef-28af-4344-85e8-9020fd3861b7',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'ReplicaSet/fullmaktsregister-api-74cd855db8 (SuccessfulCreate): Created pod: fullmaktsregister-api-74cd855db8-6brcx',
					created: '2023-04-17T12:56:56.823674Z'
				},
				{
					id: 'cc5d59cf-c2a9-4c63-aca3-41724effeabd',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-7566c75658-c6p54 (Killing): Stopping container fullmaktsregister-api',
					created: '2023-04-17T12:56:56.10636Z'
				},
				{
					id: '0adabc4f-08e4-401b-8a67-ed3bf1f00db2',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-7566c75658-c6p54 (Killing): Stopping container cloudsql-proxy',
					created: '2023-04-17T12:56:56.101455Z'
				},
				{
					id: '7057b7d8-746a-41ca-969a-695a79ce1eec',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-7566c75658-c6p54 (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:56:56.096542Z'
				},
				{
					id: 'd7796580-a3cc-4b7d-a935-2e8b310a84b9',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'ReplicaSet/fullmaktsregister-api-7566c75658 (SuccessfulDelete): Deleted pod: fullmaktsregister-api-7566c75658-c6p54',
					created: '2023-04-17T12:56:56.085604Z'
				},
				{
					id: 'd03ef969-6334-4a87-9429-edbd116e9eac',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message: 'Deployment/fullmaktsregister-api (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:56:56.064515Z'
				},
				{
					id: 'ab9b115e-a3f2-421b-b7c7-1ced481d1d96',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Deployment/fullmaktsregister-api (ScalingReplicaSet): Scaled up replica set fullmaktsregister-api-74cd855db8 to 2',
					created: '2023-04-17T12:56:55.820856Z'
				},
				{
					id: '70705305-b24b-4329-a07f-3185874ca53c',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Deployment/fullmaktsregister-api (ScalingReplicaSet): Scaled down replica set fullmaktsregister-api-7566c75658 to 1',
					created: '2023-04-17T12:56:55.781676Z'
				},
				{
					id: '2f13d07b-7270-4fe7-b9e3-ea464935e192',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Started): Started container cloudsql-proxy',
					created: '2023-04-17T12:56:24.444532Z'
				},
				{
					id: '4197c9df-95d1-4c00-a076-4c34dee4eb84',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Created): Created container cloudsql-proxy',
					created: '2023-04-17T12:56:22.642408Z'
				},
				{
					id: 'ae5325bf-e6ee-442b-992a-74cc536d0454',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Pulled): Container image "gcr.io/cloudsql-docker/gce-proxy:1.24.0-alpine" already present on machine',
					created: '2023-04-17T12:56:22.621082Z'
				},
				{
					id: '4681c592-1768-4dd2-989c-a8930bbe81dd',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Started): Started container fullmaktsregister-api',
					created: '2023-04-17T12:56:22.61631Z'
				},
				{
					id: '1198ab20-bd7c-4da2-9491-cc50984591f3',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Created): Created container fullmaktsregister-api',
					created: '2023-04-17T12:56:22.076371Z'
				},
				{
					id: '19ce71fe-d846-4b11-a76b-19bbec0aaf48',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Pulled): Successfully pulled image "europe-north1-docker.pkg.dev/nais-management-233d/team-nof/fullmaktsregister-api:2023.04.17-12.54-b55feb0" in 3.093502381s',
					created: '2023-04-17T12:56:22.009571Z'
				},
				{
					id: '90b783ec-6656-4ab2-8362-3b1168612a85',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Pulling): Pulling image "europe-north1-docker.pkg.dev/nais-management-233d/team-nof/fullmaktsregister-api:2023.04.17-12.54-b55feb0"',
					created: '2023-04-17T12:56:18.915574Z'
				},
				{
					id: '263d0dd9-89bb-4bd1-bf25-f5c37b0b8c2b',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'ServiceAccount/fullmaktsregister-api (IssuedLeafCertificate): issued certificate for fullmaktsregister-api.team-nof.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:37 +0000 UTC: 8320eca797ecf5923908e95d9290df19',
					created: '2023-04-17T12:56:17.42736Z'
				},
				{
					id: '1a4f5d46-8af1-4278-9f1d-bf098e8555e8',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:56:17.161662Z'
				},
				{
					id: '137ad7d3-854a-48b8-8bbb-b6f1d646037c',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:56:15.340685Z'
				},
				{
					id: '335748da-9bc1-4cab-a08f-f6765c90b6ca',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:56:15.305406Z'
				},
				{
					id: 'd232ce0f-0c5f-45c5-ad40-be67f1c57437',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Started): Started container linkerd-init',
					created: '2023-04-17T12:56:14.258394Z'
				},
				{
					id: '8297a9dc-4d60-4259-b1c4-d7ce40da10c1',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Created): Created container linkerd-init',
					created: '2023-04-17T12:56:10.630094Z'
				},
				{
					id: '29378007-3072-4de4-b546-ffeb87af68d9',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:56:10.596848Z'
				},
				{
					id: 'ce4091a4-d91e-4785-a590-646307e59538',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'AzureAdApplication/fullmaktsregister-api (Synchronized): Azure application is up-to-date',
					created: '2023-04-17T12:55:56.092673Z'
				},
				{
					id: '0e35e7ff-26a0-43d9-a4eb-977707e623db',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'AzureAdApplication/fullmaktsregister-api (RotatedInAzure): Azure credentials is rotated',
					created: '2023-04-17T12:55:56.066163Z'
				},
				{
					id: '097a913a-ab24-4995-9a17-8c7e4794a53c',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (FailedMount): MountVolume.SetUp failed for volume "azure-fullmaktsregister-api-0a071205-2023-16" : secret "azure-fullmaktsregister-api-0a071205-2023-16" not found',
					created: '2023-04-17T12:55:53.756615Z'
				},
				{
					id: '31550e52-c86c-48ef-b831-1a72a5e62fcf',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (FailedMount): MountVolume.SetUp failed for volume "azure-fullmaktsregister-api-0a071205-2023-16" : secret "azure-fullmaktsregister-api-0a071205-2023-16" not found',
					created: '2023-04-17T12:55:45.730132Z'
				},
				{
					id: '2d4ec08c-656a-400d-b39d-42defd0b75a7',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (FailedMount): MountVolume.SetUp failed for volume "azure-fullmaktsregister-api-0a071205-2023-16" : secret "azure-fullmaktsregister-api-0a071205-2023-16" not found',
					created: '2023-04-17T12:55:41.679427Z'
				},
				{
					id: 'b05936a7-e5ff-41b6-bc1e-7462a1bf7ea2',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (FailedMount): MountVolume.SetUp failed for volume "azure-fullmaktsregister-api-0a071205-2023-16" : secret "azure-fullmaktsregister-api-0a071205-2023-16" not found',
					created: '2023-04-17T12:55:39.64092Z'
				},
				{
					id: '66193484-8f17-4822-9a0c-441926e573c9',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (FailedMount): MountVolume.SetUp failed for volume "azure-fullmaktsregister-api-0a071205-2023-16" : secret "azure-fullmaktsregister-api-0a071205-2023-16" not found',
					created: '2023-04-17T12:55:38.621701Z'
				},
				{
					id: 'ed2b2e1a-78bd-4355-8b56-ce8b3d335ebf',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (FailedMount): MountVolume.SetUp failed for volume "azure-fullmaktsregister-api-0a071205-2023-16" : secret "azure-fullmaktsregister-api-0a071205-2023-16" not found',
					created: '2023-04-17T12:55:38.109506Z'
				},
				{
					id: '0fe4504c-089f-47ca-8c17-09755e55ffea',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Pod/fullmaktsregister-api-74cd855db8-d74pc (Scheduled): Successfully assigned team-nof/fullmaktsregister-api-74cd855db8-d74pc to gke-dev-gcp-nais-pod-spot-gar-5f4b0230-f8vq',
					created: '2023-04-17T12:55:37.832474Z'
				},
				{
					id: '9818441b-f401-46eb-9dc9-c26a7607fea7',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'ReplicaSet/fullmaktsregister-api-74cd855db8 (SuccessfulCreate): Created pod: fullmaktsregister-api-74cd855db8-d74pc',
					created: '2023-04-17T12:55:37.832411Z'
				},
				{
					id: 'abd40847-5cb7-4d77-aadf-81450f1ae71b',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message: 'Deployment/fullmaktsregister-api (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:55:37.06579Z'
				},
				{
					id: '5f15ba59-5d22-4cc9-8378-79cb0e40327e',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Application/fullmaktsregister-api (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:36.957962Z'
				},
				{
					id: '23437629-c7ce-455b-ae5f-eb77b1426f29',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Deployment/fullmaktsregister-api (ScalingReplicaSet): Scaled up replica set fullmaktsregister-api-74cd855db8 to 1',
					created: '2023-04-17T12:55:36.830501Z'
				},
				{
					id: '31c8f896-c408-45ac-9278-3baf6e57ed6a',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message: 'SQLInstance/fullmaktsregister-api (UpToDate): The resource is up to date',
					created: '2023-04-17T12:55:36.466845Z'
				},
				{
					id: '574550de-43a0-4b92-b67b-fd942967ceee',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'AzureAdApplication/fullmaktsregister-api (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:55:36.33758Z'
				},
				{
					id: '141abc0c-9ce4-4789-9a0b-7c6a3cd7f8f7',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message: 'SQLInstance/fullmaktsregister-api (UpToDate): The resource is up to date',
					created: '2023-04-17T12:55:36.32248Z'
				},
				{
					id: '5c1530a4-1d8a-4935-a179-74875e76b0f5',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:35.199335Z'
				},
				{
					id: '50d530e0-d5cb-41d0-8b56-ac5a9af0c36a',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=team-nof, Name=fullmaktsregister-api',
					created: '2023-04-17T12:55:35.199317Z'
				},
				{
					id: '359d3da1-cf54-4bec-a9dd-502effe55f42',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:34.834449Z'
				}
			],
			resources: [
				{
					id: '9e38d52d-8ad0-4071-a8db-d60a701a16cb',
					deploymentID: 'e5fa71bc-cd9b-4c4e-8237-193fe600b709',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'fullmaktsregister-api',
					namespace: 'team-nof'
				}
			]
		},
		{
			deployment: {
				id: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
				team: 'teamdatajegerne',
				created: '2023-04-17T12:55:11.149792Z',
				githubID: 871341042,
				githubRepository: 'navikt/etterlevelse',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: 'edb97fff-62ae-4f37-9ddb-89132671e829',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:57:01.933876Z'
				},
				{
					id: '4a2b0e69-b3e2-4051-8090-55b2ce4e024e',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:57:01.923066Z'
				},
				{
					id: '166e4edc-6227-4afb-8d5d-fc34f24f1397',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:56.928598Z'
				},
				{
					id: 'bdf2c4ab-c983-4de5-a1de-d591b8085eaf',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:56.917742Z'
				},
				{
					id: '1cdce7c1-ba4b-4428-8e28-f2d9bb8b810e',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:51.923223Z'
				},
				{
					id: '87817fb0-5a03-46af-b45c-bd80e1560923',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:51.916321Z'
				},
				{
					id: 'be52c187-6eb1-4617-b905-1bbff9c62e40',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:46.94972Z'
				},
				{
					id: '05118186-6ec1-472d-b713-03129fd65a02',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:46.938941Z'
				},
				{
					id: 'f0cfed61-baa1-40a6-8ae4-2ab0b1320814',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Started): Started container cloudsql-proxy',
					created: '2023-04-17T12:56:33.566593Z'
				},
				{
					id: '5700574a-d484-465e-aa84-9ac62c0528b1',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Created): Created container cloudsql-proxy',
					created: '2023-04-17T12:56:32.141425Z'
				},
				{
					id: '73b1337c-be73-4a6a-976f-22a89289b740',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Pulled): Container image "gcr.io/cloudsql-docker/gce-proxy:1.24.0-alpine" already present on machine',
					created: '2023-04-17T12:56:32.12258Z'
				},
				{
					id: 'bdc65616-21b5-47f5-ac16-9261d508ab76',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Started): Started container etterlevelse-backend',
					created: '2023-04-17T12:56:32.117643Z'
				},
				{
					id: 'fb41a610-bfeb-4337-ac94-800890ec850f',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Created): Created container etterlevelse-backend',
					created: '2023-04-17T12:56:31.601757Z'
				},
				{
					id: '7033c5a3-b3ab-4403-9e3f-6d1366f0b291',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Pulled): Successfully pulled image "ghcr.io/navikt/etterlevelse/etterlevelsebackend:cfba2185982420105d48cf0d732b762238edc231" in 5.317149327s',
					created: '2023-04-17T12:56:31.549027Z'
				},
				{
					id: '601a0b32-470b-480c-95b2-283ec18dbc30',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Pulling): Pulling image "ghcr.io/navikt/etterlevelse/etterlevelsebackend:cfba2185982420105d48cf0d732b762238edc231"',
					created: '2023-04-17T12:56:26.231242Z'
				},
				{
					id: 'c80c33e6-7355-43ef-a63c-35a6a2e0c904',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'ServiceAccount/etterlevelse-backend (IssuedLeafCertificate): issued certificate for etterlevelse-backend.teamdatajegerne.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:44 +0000 UTC: aa7b8b955cdb3fe88010450f2bdd0ace',
					created: '2023-04-17T12:56:24.433762Z'
				},
				{
					id: 'c42ba03b-e2ea-4924-8fcc-4f8af8ab17d1',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:56:24.366258Z'
				},
				{
					id: 'e353d8cf-03fc-47db-9bd0-779c8dd7e42c',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:23.320404Z'
				},
				{
					id: 'd1bda6f1-e25c-44d8-82c3-e3fd2aa83c75',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:56:22.5986Z'
				},
				{
					id: '7f9d6b4d-4f4d-428b-ad4f-cdff9be612fc',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:56:22.564758Z'
				},
				{
					id: 'db13b744-868b-4036-8d91-e5970fa96479',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Started): Started container linkerd-init',
					created: '2023-04-17T12:56:21.168594Z'
				},
				{
					id: '23917ae3-2afe-4262-946f-80c117911ef5',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (FailedPreStopHook): Exec lifecycle hook ([sleep 5]) for Container "etterlevelse-backend" in Pod "etterlevelse-backend-7d9dc7cdb6-dfpln_teamdatajegerne(a58d37c5-437e-4648-80bb-d9a939e4361f)" failed - error: command \'sleep 5\' exited with 137: , message: ""',
					created: '2023-04-17T12:56:19.38163Z'
				},
				{
					id: '04cbb77a-5e52-4f18-be24-07f17188b7da',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:18.322794Z'
				},
				{
					id: '235accf5-6ce8-4c4b-8ee4-91d50ad2fd1a',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Created): Created container linkerd-init',
					created: '2023-04-17T12:56:17.558306Z'
				},
				{
					id: '80317224-9b57-4d56-9d7e-09a1908a65f5',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:56:17.521858Z'
				},
				{
					id: 'a8ad6e9e-708f-4ce1-8ecb-639f657886dd',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-mn4tr (Scheduled): Successfully assigned teamdatajegerne/etterlevelse-backend-7975595954-mn4tr to gke-dev-gcp-nais-pool-cd-spot-6a842aac-3fr7',
					created: '2023-04-17T12:56:16.283062Z'
				},
				{
					id: 'e307deb8-27da-47a8-84b3-f06aa0cfaf96',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'ReplicaSet/etterlevelse-backend-7975595954 (SuccessfulCreate): Created pod: etterlevelse-backend-7975595954-mn4tr',
					created: '2023-04-17T12:56:16.268795Z'
				},
				{
					id: '943e4e73-fa43-4065-a09d-0dee602ada86',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:15.529249Z'
				},
				{
					id: 'bb69dc51-4307-4ca1-9ac0-a9916de1814d',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Killing): Stopping container cloudsql-proxy',
					created: '2023-04-17T12:56:15.522951Z'
				},
				{
					id: '4acb9558-455d-493e-b7e7-0aa98a536038',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Killing): Stopping container etterlevelse-backend',
					created: '2023-04-17T12:56:15.518516Z'
				},
				{
					id: 'f6e4a6ee-de46-4503-8bed-b4ad8f71fca9',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:56:15.513402Z'
				},
				{
					id: '469bbca5-aea6-4219-9cf4-bd5fe011ea63',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'ReplicaSet/etterlevelse-backend-7d9dc7cdb6 (SuccessfulDelete): Deleted pod: etterlevelse-backend-7d9dc7cdb6-dfpln',
					created: '2023-04-17T12:56:15.505372Z'
				},
				{
					id: '8eb7cdb5-a774-4a68-a5e7-786971f0f419',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message: 'Deployment/etterlevelse-backend (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:56:15.498453Z'
				},
				{
					id: 'f40d86b4-0199-4dfe-8347-397822236715',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Deployment/etterlevelse-backend (ScalingReplicaSet): (combined from similar events): Scaled up replica set etterlevelse-backend-7975595954 to 2',
					created: '2023-04-17T12:56:15.235871Z'
				},
				{
					id: 'bcb58258-70d2-432a-a17d-7582113b579f',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Deployment/etterlevelse-backend (ScalingReplicaSet): Scaled down replica set etterlevelse-backend-7d9dc7cdb6 to 2',
					created: '2023-04-17T12:56:15.200123Z'
				},
				{
					id: '36e582e0-5db6-45aa-9ad8-849578174bbd',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:09.891899Z'
				},
				{
					id: '723267ee-1a07-4881-95e0-7b58ca008803',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:09.881041Z'
				},
				{
					id: 'cc99e6e7-640e-4615-b136-a2c9a918874d',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Started): Started container cloudsql-proxy',
					created: '2023-04-17T12:56:06.876892Z'
				},
				{
					id: 'e4f5295d-ce9f-456a-8bfe-e45b5bdcc0ac',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Created): Created container cloudsql-proxy',
					created: '2023-04-17T12:56:05.242934Z'
				},
				{
					id: '46325543-0302-482e-ad6d-df78c8191c82',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Pulled): Container image "gcr.io/cloudsql-docker/gce-proxy:1.24.0-alpine" already present on machine',
					created: '2023-04-17T12:56:05.218682Z'
				},
				{
					id: '227a4ad1-f8cf-48c3-a2f1-c1dc96b01e7f',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Started): Started container etterlevelse-backend',
					created: '2023-04-17T12:56:05.214532Z'
				},
				{
					id: '0b926737-0447-408a-8b65-785c90fbe7a2',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:04.889827Z'
				},
				{
					id: '19d6a50d-a35b-436a-9cf5-df24f526bc44',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:56:04.881533Z'
				},
				{
					id: 'afc73388-1aba-4893-b18f-62cc84c80a57',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Created): Created container etterlevelse-backend',
					created: '2023-04-17T12:56:04.65441Z'
				},
				{
					id: '3bdc01be-9159-4e61-922d-c374cf45db50',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Pulled): Successfully pulled image "ghcr.io/navikt/etterlevelse/etterlevelsebackend:ce55980027e6ce5e41fe02fb89c8bad720e04c0a" in 7.438862562s',
					created: '2023-04-17T12:56:04.584994Z'
				},
				{
					id: '0cfa86cd-6768-449c-89ef-c77fdb475690',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:59.888302Z'
				},
				{
					id: 'c4bac6b4-1e53-497e-a85e-4d6f681d6978',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:59.881483Z'
				},
				{
					id: '288d9ba2-0600-4a06-8288-152807c56e87',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Pulling): Pulling image "ghcr.io/navikt/etterlevelse/etterlevelsebackend:ce55980027e6ce5e41fe02fb89c8bad720e04c0a"',
					created: '2023-04-17T12:55:57.145849Z'
				},
				{
					id: '19bcb5ae-bc19-4453-b1ee-5990d65873d5',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'ServiceAccount/etterlevelse-backend (IssuedLeafCertificate): issued certificate for etterlevelse-backend.teamdatajegerne.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:56:15 +0000 UTC: a551de36ecdfff6c4fd5757e8ed5760e',
					created: '2023-04-17T12:55:55.363252Z'
				},
				{
					id: 'e4db2553-4fe8-4f2d-b10e-7a126edfac02',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:55:55.339725Z'
				},
				{
					id: '98b0fdd1-18db-4d8b-b013-0f58c3c39024',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:54.887086Z'
				},
				{
					id: 'f8e03283-55b4-4719-b50d-92d97e21a9ce',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:54.879691Z'
				},
				{
					id: 'b3c9b86d-1883-4e0d-811d-a272f991ec25',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:55:53.475612Z'
				},
				{
					id: '5ed68a1a-1d96-4b99-a8d6-7302f011b2cd',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:55:53.441111Z'
				},
				{
					id: 'fed6e8b7-f910-417b-9b05-cceb80ce9b51',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Started): Started container linkerd-init',
					created: '2023-04-17T12:55:52.478541Z'
				},
				{
					id: '40a7567b-6be0-4250-99e9-4d785adbe224',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:49.885805Z'
				},
				{
					id: '01308285-fb0c-48b2-abcf-b7d085a44217',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:49.878806Z'
				},
				{
					id: 'f395e101-a050-44d1-8728-10f7e8e11644',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Created): Created container linkerd-init',
					created: '2023-04-17T12:55:48.975811Z'
				},
				{
					id: 'db2e595b-04f7-452a-a775-53f68f2e55c2',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:55:48.944937Z'
				},
				{
					id: 'd0f27f49-1228-447e-8435-d2c209146080',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7d9dc7cdb6-dfpln (Scheduled): Successfully assigned teamdatajegerne/etterlevelse-backend-7d9dc7cdb6-dfpln to gke-dev-gcp-nais-pool-cd-spot-59d8a2d9-dgkg',
					created: '2023-04-17T12:55:47.688266Z'
				},
				{
					id: 'c9c60591-ae81-46f2-a793-ad55373b98d0',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'ReplicaSet/etterlevelse-backend-7d9dc7cdb6 (SuccessfulCreate): Created pod: etterlevelse-backend-7d9dc7cdb6-dfpln',
					created: '2023-04-17T12:55:47.672164Z'
				},
				{
					id: '1671b0fa-2647-42e0-93d1-8d74683752de',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message: 'Deployment/etterlevelse-backend (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:55:46.97457Z'
				},
				{
					id: 'c4e645ce-2a31-493a-99dd-d915ab5a74b4',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Deployment/etterlevelse-backend (ScalingReplicaSet): (combined from similar events): Scaled up replica set etterlevelse-backend-7d9dc7cdb6 to 3',
					created: '2023-04-17T12:55:46.727634Z'
				},
				{
					id: 'e81f63bb-ede1-4683-95f5-a242d7d742d9',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'HorizontalPodAutoscaler/etterlevelse-backend (SuccessfulRescale): New size: 3; reason: cpu resource utilization (percentage of request) above target',
					created: '2023-04-17T12:55:46.703301Z'
				},
				{
					id: 'a790c7c9-8e1c-4bb9-95ca-fa21f4c3a58d',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Readiness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:44.884633Z'
				},
				{
					id: '1437bfd8-0d31-48d6-bb57-7ce69584497d',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Unhealthy): Liveness probe failed: HTTP probe failed with statuscode: 502',
					created: '2023-04-17T12:55:44.877092Z'
				},
				{
					id: 'd870fd7d-d583-4250-9233-d9cb952ebcf4',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Started): Started container cloudsql-proxy',
					created: '2023-04-17T12:55:33.310103Z'
				},
				{
					id: '43d863d9-e213-4cc0-992b-584e53390418',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Created): Created container cloudsql-proxy',
					created: '2023-04-17T12:55:31.732467Z'
				},
				{
					id: '9a823a75-5333-475c-af95-07137a4b5410',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Pulled): Container image "gcr.io/cloudsql-docker/gce-proxy:1.24.0-alpine" already present on machine',
					created: '2023-04-17T12:55:31.711246Z'
				},
				{
					id: '2bc8806e-b3d8-43ca-b7b1-1661c560c785',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Started): Started container etterlevelse-backend',
					created: '2023-04-17T12:55:31.705794Z'
				},
				{
					id: '03c22a23-0881-44b1-bec7-4e948ab4dfe6',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Created): Created container etterlevelse-backend',
					created: '2023-04-17T12:55:31.149202Z'
				},
				{
					id: '7431dcc8-0275-4aea-b70f-d21b7656d460',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Pulled): Successfully pulled image "ghcr.io/navikt/etterlevelse/etterlevelsebackend:cfba2185982420105d48cf0d732b762238edc231" in 7.445013487s',
					created: '2023-04-17T12:55:31.043934Z'
				},
				{
					id: '7e09994f-1497-490c-8eb0-2c69b580594f',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Pulling): Pulling image "ghcr.io/navikt/etterlevelse/etterlevelsebackend:cfba2185982420105d48cf0d732b762238edc231"',
					created: '2023-04-17T12:55:23.598515Z'
				},
				{
					id: '4450dcda-2e0e-43b6-b58b-ad9515412cb0',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'ServiceAccount/etterlevelse-backend (IssuedLeafCertificate): issued certificate for etterlevelse-backend.teamdatajegerne.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:55:41 +0000 UTC: 98168e1d0663a29385038e9c584fdd05',
					created: '2023-04-17T12:55:21.993535Z'
				},
				{
					id: 'b98b9bf9-717e-4992-b6c6-4d1df5291f21',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:55:21.930088Z'
				},
				{
					id: 'dc1ce863-be22-4714-acaa-4e5c9a63914c',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:55:20.07763Z'
				},
				{
					id: 'ce1a2fac-2e99-439f-859a-c3140b109265',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:55:20.037601Z'
				},
				{
					id: '7d10e83e-5f12-48c6-b660-23654af0aba3',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Started): Started container linkerd-init',
					created: '2023-04-17T12:55:19.290418Z'
				},
				{
					id: '63d33080-1dec-4189-944f-dd58b488da10',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Created): Created container linkerd-init',
					created: '2023-04-17T12:55:15.589534Z'
				},
				{
					id: 'b31b7555-8ccf-4c41-a0f8-ab412d2f52fc',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:55:15.547104Z'
				},
				{
					id: '5b4f91d3-f3f5-48d5-b98a-047b4299d9d3',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Pod/etterlevelse-backend-7975595954-4c9cm (Scheduled): Successfully assigned teamdatajegerne/etterlevelse-backend-7975595954-4c9cm to gke-dev-gcp-nais-pool-cd-spot-f4ebade9-vkbv',
					created: '2023-04-17T12:55:14.547889Z'
				},
				{
					id: '43966da9-cd09-42f6-973c-514e381886b6',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'ReplicaSet/etterlevelse-backend-7975595954 (SuccessfulCreate): Created pod: etterlevelse-backend-7975595954-4c9cm',
					created: '2023-04-17T12:55:14.535981Z'
				},
				{
					id: 'b363a647-e6e5-42bb-bf03-ca88f6c63325',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message: 'Deployment/etterlevelse-backend (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:55:13.798241Z'
				},
				{
					id: 'd03c0261-544b-4d61-9856-7ab8cb324eb1',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Application/etterlevelse-backend (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:13.65048Z'
				},
				{
					id: '27c00d17-2751-4b2e-8c44-c614df980d4d',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Deployment/etterlevelse-backend (ScalingReplicaSet): (combined from similar events): Scaled up replica set etterlevelse-backend-7975595954 to 1',
					created: '2023-04-17T12:55:13.523338Z'
				},
				{
					id: 'db48b1e9-c8b4-4f1b-8bc8-4a51ec1b7a21',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'AzureAdApplication/etterlevelse-backend (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:55:13.045527Z'
				},
				{
					id: '57fa1ebc-28cf-4b75-9a48-6a8c01478a08',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:11.7963Z'
				},
				{
					id: 'd302c2b0-86e6-4c5c-9863-d3f69bbd245b',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=teamdatajegerne, Name=etterlevelse-backend',
					created: '2023-04-17T12:55:11.796284Z'
				},
				{
					id: 'b0014bd1-cd17-46e3-9838-71794801176e',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:11.442198Z'
				}
			],
			resources: [
				{
					id: 'f6954e0b-759a-4616-a41a-8cab4826bcc0',
					deploymentID: '7fc0c747-6ff6-416a-8407-b0c1362706fa',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'etterlevelse-backend',
					namespace: 'teamdatajegerne'
				}
			]
		},
		{
			deployment: {
				id: '22146525-c225-42f0-8bce-7d3d581c2967',
				team: 'nais-verification',
				created: '2023-04-17T12:55:04.216485Z',
				githubID: null,
				githubRepository: null,
				cluster: 'ci-gcp',
				state: null
			},
			statuses: [
				{
					id: '8524f073-cd61-4e2d-a295-33af4b25fb1d',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:10.299586Z'
				},
				{
					id: 'dcde965e-7a5d-417a-9db8-9463da702ed0',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:10.299295Z'
				},
				{
					id: '45010c87-01b5-4377-a56f-831d7b799dd3',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-6446c55b68-sg7qp (Killing): Stopping container nais-deploy-canary',
					created: '2023-04-17T12:55:09.469284Z'
				},
				{
					id: '593c4cf2-9b16-4376-a13b-e62c9aa5d0ab',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-6446c55b68 (SuccessfulDelete): Deleted pod: nais-deploy-canary-6446c55b68-sg7qp',
					created: '2023-04-17T12:55:09.468478Z'
				},
				{
					id: 'f4ac5d31-fab3-409b-bd26-025787eb3c2d',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled down replica set nais-deploy-canary-6446c55b68 to 0',
					created: '2023-04-17T12:55:09.251014Z'
				},
				{
					id: '45609b84-54d5-488e-8006-e7fc986016db',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-86946b6bb8-2grcz (Started): Started container nais-deploy-canary',
					created: '2023-04-17T12:55:08.771085Z'
				},
				{
					id: '585c3f7a-b9da-4370-9d69-28308e2d60b4',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-86946b6bb8-2grcz (Created): Created container nais-deploy-canary',
					created: '2023-04-17T12:55:07.50445Z'
				},
				{
					id: 'e0865a49-1353-4c59-a3f9-368796b2aca9',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-86946b6bb8-2grcz (Pulled): Container image "ghcr.io/nais/testapp/testapp:2020-02-25-f61e7b7" already present on machine',
					created: '2023-04-17T12:55:07.485834Z'
				},
				{
					id: '9728313d-3874-4d97-a029-8c36fd6610ce',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-86946b6bb8-2grcz (Scheduled): Successfully assigned nais-verification/nais-deploy-canary-86946b6bb8-2grcz to gke-ci-gcp-nais-pool-cd-spot-79eae813-shci',
					created: '2023-04-17T12:55:05.669138Z'
				},
				{
					id: 'f0cbcf13-e05a-454b-8779-6569b158a24d',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-86946b6bb8 (SuccessfulCreate): Created pod: nais-deploy-canary-86946b6bb8-2grcz',
					created: '2023-04-17T12:55:05.658419Z'
				},
				{
					id: '9ae9edda-b027-4752-8a53-859ed2c9f127',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (InjectionSkipped): Linkerd sidecar proxy injection skipped: neither the namespace nor the pod have the annotation "linkerd.io/inject:enabled"',
					created: '2023-04-17T12:55:05.345566Z'
				},
				{
					id: 'a3bb8bea-27d2-4140-a0a5-5605c3f3fd4d',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:05.231379Z'
				},
				{
					id: '44174322-23d1-486a-a61e-970a377c38a7',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:04.639036Z'
				},
				{
					id: '973c2a74-e4e4-4f41-928f-1a0b82fc0548',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:04.639006Z'
				},
				{
					id: '820b3fee-aa15-4660-ad5c-c3c973e84082',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:04.302181Z'
				}
			],
			resources: [
				{
					id: '8618940f-f17e-42c3-b4f3-7c7cc9df1a49',
					deploymentID: '22146525-c225-42f0-8bce-7d3d581c2967',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: '9a87614d-962e-4260-94a6-a6efe192987f',
				team: 'nais-verification',
				created: '2023-04-17T12:55:04.11323Z',
				githubID: null,
				githubRepository: null,
				cluster: 'dev',
				state: null
			},
			statuses: [
				{
					id: '8e952554-9dc5-4436-9b8c-e767660a746c',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:15.164366Z'
				},
				{
					id: '145e1c1f-01da-45a6-83cf-bda3e7accf90',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:15.16419Z'
				},
				{
					id: '1d4a1238-7db3-4f9b-96fe-cb0dc904d1e1',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled down replica set nais-deploy-canary-cc5769f7c to 0',
					created: '2023-04-17T12:55:11.778109Z'
				},
				{
					id: 'f27f20cf-66f2-4cf6-bbcf-12ac75d3b4f8',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:05.081462Z'
				},
				{
					id: 'eb218ffd-fdae-4e5a-b3ee-bad810bd5c8d',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:04.540474Z'
				},
				{
					id: '6ee8840f-66a8-4c79-b2bd-b4da1f574e74',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:04.540454Z'
				},
				{
					id: '4cd29734-823a-4403-973c-46b9caaf8e5c',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:04.195002Z'
				}
			],
			resources: [
				{
					id: '7fd48b65-740b-401a-b267-c45927af6649',
					deploymentID: '9a87614d-962e-4260-94a6-a6efe192987f',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
				team: 'nais-verification',
				created: '2023-04-17T12:55:04.012333Z',
				githubID: null,
				githubRepository: null,
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '07d5dee3-05d6-4c20-9cf4-ca568e1b50db',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:15.268536Z'
				},
				{
					id: 'fe2ae992-b957-4bf0-a0d3-eee8d87fb91c',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:15.268365Z'
				},
				{
					id: '74a689c8-9627-42ac-8cd2-864fec7a2dec',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-77c78d7c76-jhtgs (Killing): Stopping container nais-deploy-canary',
					created: '2023-04-17T12:55:10.360951Z'
				},
				{
					id: '4ee7d9b6-6c13-4dc4-b053-b34574c93757',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-77c78d7c76 (SuccessfulDelete): Deleted pod: nais-deploy-canary-77c78d7c76-jhtgs',
					created: '2023-04-17T12:55:10.349811Z'
				},
				{
					id: 'a7a9c476-74bc-42a9-892b-3321346b0b89',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-7777bfdcd8-9t46p (Started): Started container nais-deploy-canary',
					created: '2023-04-17T12:55:09.445835Z'
				},
				{
					id: '378e7f99-e9d5-41ff-ac7d-76f08b6dd604',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-7777bfdcd8-9t46p (Created): Created container nais-deploy-canary',
					created: '2023-04-17T12:55:07.536335Z'
				},
				{
					id: 'e4a79aa1-f3f5-4414-8f9b-41418d3fb676',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-7777bfdcd8-9t46p (Pulled): Container image "ghcr.io/nais/testapp/testapp:2020-02-25-f61e7b7" already present on machine',
					created: '2023-04-17T12:55:07.51069Z'
				},
				{
					id: '47b44619-393f-4a61-b112-7fbe76747119',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-7777bfdcd8-9t46p (Scheduled): Successfully assigned nais-verification/nais-deploy-canary-7777bfdcd8-9t46p to gke-dev-gcp-nais-pool-cd-spot-6a842aac-nt7v',
					created: '2023-04-17T12:55:05.361094Z'
				},
				{
					id: '57e0dddd-efb7-43ae-90bb-f74800126059',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-7777bfdcd8 (SuccessfulCreate): Created pod: nais-deploy-canary-7777bfdcd8-9t46p',
					created: '2023-04-17T12:55:05.348703Z'
				},
				{
					id: 'f2ed4c54-54d4-4dac-97a7-797f6327412c',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:05.075561Z'
				},
				{
					id: 'c092c4e1-8a29-491a-b132-82684bcea987',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (InjectionSkipped): Linkerd sidecar proxy injection skipped: neither the namespace nor the pod have the annotation "linkerd.io/inject:enabled"',
					created: '2023-04-17T12:55:05.062804Z'
				},
				{
					id: '7dd67f70-fd83-4d20-b975-4b4c6d21d9d4',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled up replica set nais-deploy-canary-7777bfdcd8 to 1',
					created: '2023-04-17T12:55:04.958671Z'
				},
				{
					id: 'ec257a49-1d8d-459b-be52-f819ce9e4d39',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:04.378719Z'
				},
				{
					id: '34f1abbb-b56f-461c-a60b-8960ec644f39',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:04.378705Z'
				},
				{
					id: 'e967e950-f140-494f-86b5-2b2c786bb75e',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:04.093686Z'
				}
			],
			resources: [
				{
					id: '32358653-e27f-43f4-a3aa-7f5797f43390',
					deploymentID: '6a0e5b3f-a170-4f29-9301-5164b77ce3bc',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
				team: 'nais-verification',
				created: '2023-04-17T12:55:03.912866Z',
				githubID: null,
				githubRepository: null,
				cluster: 'prod-fss',
				state: null
			},
			statuses: [
				{
					id: '70382cf1-48b5-4cc9-b8ab-74734038e665',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:09.472406Z'
				},
				{
					id: 'c8648162-9559-4968-9054-22a30e482189',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:09.472286Z'
				},
				{
					id: '182ce50b-af59-42d0-8e30-079968a524ed',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-5c48b8bd9c-dxzxg (Killing): Stopping container nais-deploy-canary',
					created: '2023-04-17T12:55:06.066423Z'
				},
				{
					id: '492ca7fb-a9c8-4836-b123-f87ba3914544',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-5c48b8bd9c (SuccessfulDelete): Deleted pod: nais-deploy-canary-5c48b8bd9c-dxzxg',
					created: '2023-04-17T12:55:06.066386Z'
				},
				{
					id: 'e58266f1-1128-4418-9bb4-e90323425460',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:04.408761Z'
				},
				{
					id: 'f56c5948-9107-4c60-bd02-1e09c111519f',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled up replica set nais-deploy-canary-9ff494c8f to 1',
					created: '2023-04-17T12:55:04.403427Z'
				},
				{
					id: '0f612a7f-1ec3-462c-b4b0-8dbdb766a18b',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:04.063295Z'
				},
				{
					id: 'c597e035-600a-4c4a-b2b5-77c34b1ef492',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:04.063282Z'
				},
				{
					id: '8ecf70d9-5b5e-49c0-a266-c149cbb5d6c5',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:03.993616Z'
				}
			],
			resources: [
				{
					id: '9af27fd5-aee8-44b2-8578-401aa3f96ed8',
					deploymentID: '2dd7bab5-da5d-4da2-ab7e-4e6f40df2609',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
				team: 'nais-verification',
				created: '2023-04-17T12:55:03.813189Z',
				githubID: null,
				githubRepository: null,
				cluster: 'prod',
				state: null
			},
			statuses: [
				{
					id: '5eead06c-7c41-4512-9244-2b02759702ce',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:14.787393Z'
				},
				{
					id: '1c9bc3bd-9360-4b40-91f2-7a3a9519dff8',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:14.786557Z'
				},
				{
					id: '0a0b2753-5717-4f54-b2bb-190a978bc0d2',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled down replica set nais-deploy-canary-7ff796bdb to 0',
					created: '2023-04-17T12:55:10.687438Z'
				},
				{
					id: '2af26bef-3119-495d-97ce-2b0185d3cb48',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:04.714357Z'
				},
				{
					id: '1f45bd2c-f3fc-402e-ba29-63510721b059',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:04.159757Z'
				},
				{
					id: '6e423a8c-f67f-4130-822e-f5823b95ceaf',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:04.159738Z'
				},
				{
					id: 'cc1bddea-71e6-4fc7-9c9a-5c10ddd7b36c',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:03.892353Z'
				}
			],
			resources: [
				{
					id: 'ec6c3cdc-da3f-44c0-9e55-a332b9ccd07a',
					deploymentID: 'efbe8d32-41d4-4989-bd9b-cb79b0743849',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: '7960fb4f-5847-4ee1-93a1-2239f90352be',
				team: 'nais-verification',
				created: '2023-04-17T12:55:03.71184Z',
				githubID: null,
				githubRepository: null,
				cluster: 'prod-gcp',
				state: null
			},
			statuses: [
				{
					id: 'a830e587-5989-412c-96d6-83c65111b62b',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:14.879735Z'
				},
				{
					id: '4b097df4-c5d9-4ad5-a74e-580ea18706e0',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:14.879554Z'
				},
				{
					id: 'bbf6cdd0-154f-45c1-a50e-0d5a7f635851',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-657689fdf6-q6b8n (Killing): Stopping container nais-deploy-canary',
					created: '2023-04-17T12:55:10.679731Z'
				},
				{
					id: '50b4b4d2-8d0d-49f2-9634-be62dce8c050',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-657689fdf6 (SuccessfulDelete): Deleted pod: nais-deploy-canary-657689fdf6-q6b8n',
					created: '2023-04-17T12:55:10.674381Z'
				},
				{
					id: 'a9adc9bc-bad4-4a27-a057-e9b49423e6bd',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled down replica set nais-deploy-canary-657689fdf6 to 0',
					created: '2023-04-17T12:55:10.477988Z'
				},
				{
					id: 'e9ffd81a-7b00-44c0-8315-79af7ab99c2d',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-8564547968-shb4r (Started): Started container nais-deploy-canary',
					created: '2023-04-17T12:55:08.704627Z'
				},
				{
					id: '5625815e-f91b-404d-a665-5452cca7fa6c',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-8564547968-shb4r (Created): Created container nais-deploy-canary',
					created: '2023-04-17T12:55:07.003759Z'
				},
				{
					id: '53229a71-a962-43c2-b9a1-8f6bef4730c5',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-8564547968-shb4r (Pulled): Container image "ghcr.io/nais/testapp/testapp:2020-02-25-f61e7b7" already present on machine',
					created: '2023-04-17T12:55:06.976986Z'
				},
				{
					id: '2d568ce3-e50c-484f-a5ae-a376dc3eabca',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-8564547968-shb4r (Scheduled): Successfully assigned nais-verification/nais-deploy-canary-8564547968-shb4r to gke-prod-gcp-nais-pool-cd-2-34e9f59b-ttq9',
					created: '2023-04-17T12:55:04.935302Z'
				},
				{
					id: '1706930c-cd47-4aa5-b095-dff2d75ed61b',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-8564547968 (SuccessfulCreate): Created pod: nais-deploy-canary-8564547968-shb4r',
					created: '2023-04-17T12:55:04.920816Z'
				},
				{
					id: 'c884960c-3e7c-453b-88c7-6a35b9011d29',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (InjectionSkipped): Linkerd sidecar proxy injection skipped: neither the namespace nor the pod have the annotation "linkerd.io/inject:enabled"',
					created: '2023-04-17T12:55:04.723341Z'
				},
				{
					id: '17457197-0ae6-41e2-9a5d-fe1db3d4358e',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:04.709264Z'
				},
				{
					id: 'f3521865-b56b-4549-99a9-f7412088319c',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:04.076036Z'
				},
				{
					id: 'a1f17f5f-f2e3-4b6c-9341-9dbf3ba4ab19',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:04.07601Z'
				},
				{
					id: '8ca328fe-55e9-4561-92f4-7ac5c9f5293c',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:03.79404Z'
				}
			],
			resources: [
				{
					id: '09c82ac0-6a40-4fbc-8011-d613197bd2d4',
					deploymentID: '7960fb4f-5847-4ee1-93a1-2239f90352be',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
				team: 'nais-verification',
				created: '2023-04-17T12:55:03.611092Z',
				githubID: null,
				githubRepository: null,
				cluster: 'dev-fss',
				state: null
			},
			statuses: [
				{
					id: '383683b6-019f-40e6-80a8-c6cf75abadd8',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:09.519032Z'
				},
				{
					id: '8eecd0eb-3f88-4cac-b904-f21645b1f12d',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:09.518903Z'
				},
				{
					id: 'c1cb4479-314e-487d-8fdc-9746ff6da7f1',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-694f6b6f6d-k42kx (Killing): Stopping container nais-deploy-canary',
					created: '2023-04-17T12:55:05.813403Z'
				},
				{
					id: '69c2bb2f-c56f-406c-b938-1ecac87be80c',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-694f6b6f6d (SuccessfulDelete): Deleted pod: nais-deploy-canary-694f6b6f6d-k42kx',
					created: '2023-04-17T12:55:05.793217Z'
				},
				{
					id: 'de564781-e012-496d-99f0-d39b1f1eda39',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-75b6d4496d-mlm9x (Started): Started container nais-deploy-canary',
					created: '2023-04-17T12:55:05.232068Z'
				},
				{
					id: '14cf0b86-db7a-4f21-9a9a-c8527f207e13',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-75b6d4496d-mlm9x (Created): Created container nais-deploy-canary',
					created: '2023-04-17T12:55:05.054709Z'
				},
				{
					id: 'c033f1d9-561a-4235-87da-6839b6027e0e',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-75b6d4496d-mlm9x (Pulled): Container image "ghcr.io/nais/testapp/testapp:2020-02-25-f61e7b7" already present on machine',
					created: '2023-04-17T12:55:05.037557Z'
				},
				{
					id: '6d941c34-7b57-44fb-8089-ff36a08d7919',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-75b6d4496d (SuccessfulCreate): Created pod: nais-deploy-canary-75b6d4496d-mlm9x',
					created: '2023-04-17T12:55:04.527019Z'
				},
				{
					id: '970fbe2c-3057-4a7f-9d51-b26487ed99e5',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:04.395802Z'
				},
				{
					id: '1f80ac5b-35c7-43a0-8357-d9808dc138bd',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled up replica set nais-deploy-canary-75b6d4496d to 1',
					created: '2023-04-17T12:55:04.30068Z'
				},
				{
					id: 'bf65699d-4e28-40d8-9030-cc3532917632',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:03.823691Z'
				},
				{
					id: '1bfc9044-1341-4b63-89bb-a2282b1f4f0e',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:03.823679Z'
				},
				{
					id: '66ecbe2b-eb95-4b24-bfb3-4d4ca129b530',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:03.692783Z'
				}
			],
			resources: [
				{
					id: 'f3f8e223-42ab-4ede-bdc9-904a555441ac',
					deploymentID: '30036954-fc6f-47cc-ba0e-210702a8c0c5',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: '1ecbcec0-a252-467c-abf5-c873346540db',
				team: 'nais-verification',
				created: '2023-04-17T12:55:03.511692Z',
				githubID: null,
				githubRepository: null,
				cluster: 'ci',
				state: null
			},
			statuses: [
				{
					id: '6122bc32-36f8-4fd8-94d8-c771fa36f8fe',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:14.549222Z'
				},
				{
					id: '2094140c-a769-4dd3-8fa5-b5d201632d2c',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:14.548978Z'
				},
				{
					id: '8134acbd-c3b0-44a1-9941-773a9bc20962',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-7d477978bf-nb4gf (Killing): Stopping container nais-deploy-canary',
					created: '2023-04-17T12:55:12.585711Z'
				},
				{
					id: 'f40ae97b-c0ab-4ea5-b135-59da3b71fb7b',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-7d477978bf (SuccessfulDelete): Deleted pod: nais-deploy-canary-7d477978bf-nb4gf',
					created: '2023-04-17T12:55:12.580862Z'
				},
				{
					id: 'bc607ceb-6418-49b8-a3a7-824d1ad395bf',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-864898c68f-xnpfb (Started): Started container nais-deploy-canary',
					created: '2023-04-17T12:55:12.018578Z'
				},
				{
					id: '8b84eef2-0fc7-4c48-9d1e-ee76d41f696e',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-864898c68f-xnpfb (Created): Created container nais-deploy-canary',
					created: '2023-04-17T12:55:09.79867Z'
				},
				{
					id: 'd5c0a0dc-5157-4296-97aa-38b4849b8b47',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-864898c68f-xnpfb (Pulled): Container image "ghcr.io/nais/testapp/testapp:2020-02-25-f61e7b7" already present on machine',
					created: '2023-04-17T12:55:09.746815Z'
				},
				{
					id: '08d6eea0-996c-422e-86cf-e634a74ad1a5',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-864898c68f-xnpfb (Scheduled): Successfully assigned nais-verification/nais-deploy-canary-864898c68f-xnpfb to gke-nais-ci-nap-e2-standard-2-8lxoths-40541d51-btb1',
					created: '2023-04-17T12:55:04.823469Z'
				},
				{
					id: 'a3b33241-fbd8-4f04-ab8c-3a6dd2fd44ac',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-864898c68f (SuccessfulCreate): Created pod: nais-deploy-canary-864898c68f-xnpfb',
					created: '2023-04-17T12:55:04.812044Z'
				},
				{
					id: 'bd8a2959-c400-48a4-aada-b3a8ce1eca32',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled up replica set nais-deploy-canary-864898c68f to 1',
					created: '2023-04-17T12:55:04.459509Z'
				},
				{
					id: '2c5e2917-8b78-428e-87cf-25c8aeb3eb87',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:04.437645Z'
				},
				{
					id: '521945ce-89dc-4c74-8d65-149d1a82c2f9',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:03.92401Z'
				},
				{
					id: '67593d3c-2ca5-4a2e-983d-9f39781a1054',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:03.92399Z'
				},
				{
					id: '1d244bf4-162b-4759-b928-fda2a3e4cbd7',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:03.592355Z'
				}
			],
			resources: [
				{
					id: '0688109c-e074-481e-8772-d724bea55d45',
					deploymentID: '1ecbcec0-a252-467c-abf5-c873346540db',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
				team: 'nais-verification',
				created: '2023-04-17T12:55:03.385759Z',
				githubID: null,
				githubRepository: null,
				cluster: 'ci-fss',
				state: null
			},
			statuses: [
				{
					id: '3f67f2b7-4b7d-4b75-a970-43bd8237be6e',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:08.977299Z'
				},
				{
					id: '3510efa4-30e0-4eea-8960-c72741df0dc7',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'in_progress',
					message: 'Application/nais-deploy-canary (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:08.977201Z'
				},
				{
					id: 'b151dd0c-cc42-42ae-81e2-28973f350f96',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'in_progress',
					message:
						'Pod/nais-deploy-canary-7fd88654cd-g6ldh (Killing): Stopping container nais-deploy-canary',
					created: '2023-04-17T12:55:05.705353Z'
				},
				{
					id: '734848b2-e6e1-42a5-ae3c-fdae08eb74c0',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'in_progress',
					message:
						'ReplicaSet/nais-deploy-canary-7fd88654cd (SuccessfulDelete): Deleted pod: nais-deploy-canary-7fd88654cd-g6ldh',
					created: '2023-04-17T12:55:05.703829Z'
				},
				{
					id: '0d9a0673-6e1b-45aa-bc4e-7d12ba7160b1',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'in_progress',
					message:
						'Deployment/nais-deploy-canary (ScalingReplicaSet): (combined from similar events): Scaled up replica set nais-deploy-canary-88556898 to 1',
					created: '2023-04-17T12:55:03.913609Z'
				},
				{
					id: '3f2e2671-4946-4517-a452-64e29b5a8876',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'in_progress',
					message:
						'Application/nais-deploy-canary (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:55:03.91356Z'
				},
				{
					id: 'fee71ef7-7658-4195-9414-92938464e6b4',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:55:03.599892Z'
				},
				{
					id: 'a5d66eb2-eaef-42c5-9537-b139a662ec8c',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=nais-verification, Name=nais-deploy-canary',
					created: '2023-04-17T12:55:03.59988Z'
				},
				{
					id: '2f026bd1-d30e-4b21-8823-54e1279856e5',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:55:03.4919Z'
				}
			],
			resources: [
				{
					id: '3f223f79-89c0-4bf4-be5f-91a07855be55',
					deploymentID: '41c000b8-bdba-46a4-bc23-6646b6ecd5e9',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'nais-deploy-canary',
					namespace: 'nais-verification'
				}
			]
		},
		{
			deployment: {
				id: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
				team: 'helsearbeidsgiver',
				created: '2023-04-17T12:54:48.352114Z',
				githubID: 871340683,
				githubRepository: 'navikt/helsearbeidsgiver-inntektsmelding',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '2ac87aec-fe11-4400-881b-889aba3edcc5',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:15.996434Z'
				},
				{
					id: '53a50405-3cd5-4ca5-a0df-0732dacb4c28',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Application/im-api (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:15.996274Z'
				},
				{
					id: '5b9ea311-5fb0-4b2e-8bb7-8378746d1fb5',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-76c59bd85b-lcvjw (Killing): Stopping container im-api',
					created: '2023-04-17T12:55:13.256635Z'
				},
				{
					id: 'af5c5914-6c35-407c-b8bf-ca4b5aea7463',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-76c59bd85b-lcvjw (Killing): Stopping container secure-logs-fluentd',
					created: '2023-04-17T12:55:13.251836Z'
				},
				{
					id: '6598f5ee-52be-4cff-be95-9a1a25fd0a9f',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-76c59bd85b-lcvjw (Killing): Stopping container secure-logs-configmap-reload',
					created: '2023-04-17T12:55:13.246698Z'
				},
				{
					id: 'a0725631-8d47-474e-b251-619aa1ca2eb7',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-76c59bd85b-lcvjw (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:55:13.238337Z'
				},
				{
					id: '2f46a5cc-b17a-4e32-a9a7-425e5747eeb2',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'ReplicaSet/im-api-76c59bd85b (SuccessfulDelete): Deleted pod: im-api-76c59bd85b-lcvjw',
					created: '2023-04-17T12:55:13.231539Z'
				},
				{
					id: '1aab0a25-9ab4-46e9-8276-2dd1b7711ab3',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Deployment/im-api (ScalingReplicaSet): Scaled down replica set im-api-76c59bd85b to 0',
					created: '2023-04-17T12:55:12.912411Z'
				},
				{
					id: '052e6bf8-4745-44f6-84b2-94241705c960',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Started): Started container secure-logs-configmap-reload',
					created: '2023-04-17T12:55:07.912189Z'
				},
				{
					id: 'ba49d3a0-646e-4c29-9f80-57d310d72d09',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Created): Created container secure-logs-configmap-reload',
					created: '2023-04-17T12:55:07.333398Z'
				},
				{
					id: '27caa25a-9aac-4513-95c4-8a0466260800',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Pulled): Container image "ghcr.io/nais/configmap-reload/configmap-reload@sha256:3f30687b1200754924484a12124f7be58a55816661d864f6d1bf44e1131b6de6" already present on machine',
					created: '2023-04-17T12:55:07.308059Z'
				},
				{
					id: '3217a7d0-7201-4476-b71f-4768fe33455d',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Started): Started container secure-logs-fluentd',
					created: '2023-04-17T12:55:07.302236Z'
				},
				{
					id: 'b6cdd86c-350d-44d8-a120-21d710de3c3e',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Created): Created container secure-logs-fluentd',
					created: '2023-04-17T12:55:06.74288Z'
				},
				{
					id: '0d37b2be-c235-4981-b1df-e76ce1304836',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/nais-logd:107" already present on machine',
					created: '2023-04-17T12:55:06.710257Z'
				},
				{
					id: '1a08eae7-bdff-4bfc-95af-79d8fae11322',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Started): Started container im-api',
					created: '2023-04-17T12:55:06.702744Z'
				},
				{
					id: '41b8e658-7be3-4bae-b1c4-5cf97893acfc',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Created): Created container im-api',
					created: '2023-04-17T12:55:06.177948Z'
				},
				{
					id: '4dc2f136-1e40-4714-b4cb-e3909bd2ac16',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Pulled): Successfully pulled image "ghcr.io/navikt/helsearbeidsgiver-inntektsmelding/im-api:a941fdb" in 4.134103827s',
					created: '2023-04-17T12:55:06.114833Z'
				},
				{
					id: '2be6aa19-e63b-4057-b91e-622b3eefc698',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Pulling): Pulling image "ghcr.io/navikt/helsearbeidsgiver-inntektsmelding/im-api:a941fdb"',
					created: '2023-04-17T12:55:01.984494Z'
				},
				{
					id: 'e8ad490c-1075-409a-b0de-ad5151697ed8',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'ServiceAccount/im-api (IssuedLeafCertificate): issued certificate for im-api.helsearbeidsgiver.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:55:20 +0000 UTC: 4c6db10e7571dd62b5ef4599e45eaaae',
					created: '2023-04-17T12:55:00.379697Z'
				},
				{
					id: 'ef813988-6396-48ae-a320-f8ca7c4cab3a',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:55:00.30378Z'
				},
				{
					id: '47c78d24-2766-467a-bb63-182753d00d4f',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:54:58.404728Z'
				},
				{
					id: '6ec11c1d-dd08-4e49-99ac-fb2bfdad924f',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:54:58.364336Z'
				},
				{
					id: 'e98d152c-4062-4e38-a302-e10b686e283c',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Started): Started container linkerd-init',
					created: '2023-04-17T12:54:57.066407Z'
				},
				{
					id: '82611622-0bd8-462b-a8b5-8d8c3dd68809',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Pod/im-api-54f4585b74-j5c9p (Created): Created container linkerd-init',
					created: '2023-04-17T12:54:53.449146Z'
				},
				{
					id: '876461da-5b1d-4001-8940-6c37f1e59bfc',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:54:53.409543Z'
				},
				{
					id: 'dfe4fba5-3267-45be-809c-ed4764ad3d44',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Pod/im-api-54f4585b74-j5c9p (Scheduled): Successfully assigned helsearbeidsgiver/im-api-54f4585b74-j5c9p to gke-dev-gcp-nais-pool-cd-spot-f4ebade9-wd2v',
					created: '2023-04-17T12:54:52.061353Z'
				},
				{
					id: '27a53495-d607-42b4-8e65-e1b50ee9a5c4',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'ReplicaSet/im-api-54f4585b74 (SuccessfulCreate): Created pod: im-api-54f4585b74-j5c9p',
					created: '2023-04-17T12:54:52.049679Z'
				},
				{
					id: '87b2264a-455d-470d-9e00-55f8c0704172',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'Deployment/im-api (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:54:51.044644Z'
				},
				{
					id: '3b4948fa-9f82-4f36-ac2c-f008ce1d193b',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Application/im-api (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:54:50.801315Z'
				},
				{
					id: 'f7e7ca4d-854b-4e4d-965c-511a6821af17',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Deployment/im-api (ScalingReplicaSet): Scaled up replica set im-api-54f4585b74 to 1',
					created: '2023-04-17T12:54:50.677855Z'
				},
				{
					id: 'c1a206f1-6118-449a-88d5-981ea800b688',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'AzureAdApplication/im-api (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:54:49.86487Z'
				},
				{
					id: '8652e937-661b-4516-b43e-82845d59497c',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:54:48.805287Z'
				},
				{
					id: 'b6b3ed2c-fbd2-4600-bfe2-2e3435754fbe',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=helsearbeidsgiver, Name=im-api',
					created: '2023-04-17T12:54:48.80527Z'
				},
				{
					id: '74100ed9-eed9-48dd-a6e0-6d3bcd20817c',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:54:48.506193Z'
				}
			],
			resources: [
				{
					id: '17318d17-6021-4cd4-9d6c-658acf2695d8',
					deploymentID: 'ea616ea9-e75c-44b5-9b25-50bc25fef694',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'im-api',
					namespace: 'helsearbeidsgiver'
				}
			]
		},
		{
			deployment: {
				id: '6d29cf58-e815-4dc5-81d8-175746b5089b',
				team: 'skjemadigitalisering',
				created: '2023-04-17T12:53:49.75006Z',
				githubID: 871339525,
				githubRepository: 'navikt/skjemautfylling-formio',
				cluster: 'prod-gcp',
				state: null
			},
			statuses: [
				{
					id: '548642c6-f42e-498f-8a7b-ec5e1a27e3d7',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:55:16.668066Z'
				},
				{
					id: 'b49dd437-d746-4a34-8b44-c56f1f940be0',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'Application/skjemautfylling (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:55:16.667851Z'
				},
				{
					id: '7d0b49e6-b4a1-4ab8-abda-ca90a7e86eb4',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-8h4zg (Killing): Stopping container skjemautfylling',
					created: '2023-04-17T12:55:16.095584Z'
				},
				{
					id: '8c4abb52-c465-4099-b266-0227fec8cd70',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'Pod/skjemautfylling-58c757ddd8-8h4zg (Killing): Stopping container wonderwall',
					created: '2023-04-17T12:55:16.089138Z'
				},
				{
					id: '5dfab495-dea6-4753-a87b-d59a8e4e20fe',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-8h4zg (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:55:16.085304Z'
				},
				{
					id: '6cfd7a8b-42cc-4879-98b4-27811c1862fb',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'ReplicaSet/skjemautfylling-58c757ddd8 (SuccessfulDelete): Deleted pod: skjemautfylling-58c757ddd8-8h4zg',
					created: '2023-04-17T12:55:16.074472Z'
				},
				{
					id: 'e217c091-c74c-43c6-956b-c8b03ab85749',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Deployment/skjemautfylling (ScalingReplicaSet): Scaled down replica set skjemautfylling-58c757ddd8 to 0',
					created: '2023-04-17T12:55:15.734955Z'
				},
				{
					id: '8ca48fb1-ec17-42e0-8f22-f1b0941a95a3',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-7h8lg (Unhealthy): Readiness probe failed: Get "http://10.7.65.153:4191/ready": dial tcp 10.7.65.153:4191: connect: connection refused',
					created: '2023-04-17T12:55:03.578694Z'
				},
				{
					id: '8090e7ff-67e2-4549-89ae-f7c6f58caadf',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-7h8lg (Unhealthy): Readiness probe failed: Get "http://10.7.65.153:8080/fyllut/internal/isReady": dial tcp 10.7.65.153:8080: connect: connection refused',
					created: '2023-04-17T12:55:03.571059Z'
				},
				{
					id: 'f982972b-0fbd-46fb-95b5-1a4acf3d9344',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-7h8lg (Unhealthy): Readiness probe failed: Get "http://10.7.65.153:4191/ready": dial tcp 10.7.65.153:4191: connect: connection refused',
					created: '2023-04-17T12:54:53.573264Z'
				},
				{
					id: '1f8a0d3b-7916-45ea-b9bb-2f8717a813da',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-7h8lg (Unhealthy): Readiness probe failed: Get "http://10.7.65.153:8080/fyllut/internal/isReady": dial tcp 10.7.65.153:8080: connect: connection refused',
					created: '2023-04-17T12:54:53.569298Z'
				},
				{
					id: 'ac454057-d423-46c6-862c-509196cebfde',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'ServiceAccount/skjemautfylling (IssuedLeafCertificate): issued certificate for skjemautfylling.skjemadigitalisering.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:55:04 +0000 UTC: 1d27018de7141410ed8c13746cc8dc69',
					created: '2023-04-17T12:54:44.024529Z'
				},
				{
					id: '02f7e37f-0631-437b-bc8b-8e9bc5d05a42',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'Pod/skjemautfylling-58c757ddd8-7h8lg (Killing): Stopping container wonderwall',
					created: '2023-04-17T12:54:34.563496Z'
				},
				{
					id: 'f47a4bc0-ff86-40a5-bb09-1065e5fde2e2',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-7h8lg (Killing): Stopping container skjemautfylling',
					created: '2023-04-17T12:54:34.558292Z'
				},
				{
					id: '071e6a99-3f35-4afc-8ef7-3bdf3191c69f',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Pod/skjemautfylling-58c757ddd8-7h8lg (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:54:34.552689Z'
				},
				{
					id: '3a4e7f2d-31b5-4a3e-8160-79f4c3ebd69d',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'ReplicaSet/skjemautfylling-58c757ddd8 (SuccessfulDelete): Deleted pod: skjemautfylling-58c757ddd8-7h8lg',
					created: '2023-04-17T12:54:34.545048Z'
				},
				{
					id: '82bac61a-ac22-4af4-9e4d-1949c9bfd302',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'Deployment/skjemautfylling (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:54:34.537011Z'
				},
				{
					id: 'd846f86d-e7eb-4fe1-ad11-b92577008400',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Deployment/skjemautfylling (ScalingReplicaSet): Scaled up replica set skjemautfylling-cd4fb8f4d to 2',
					created: '2023-04-17T12:54:34.229693Z'
				},
				{
					id: '7bc23e8d-7f0a-497b-ba79-22f456a23e85',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Deployment/skjemautfylling (ScalingReplicaSet): Scaled down replica set skjemautfylling-58c757ddd8 to 1',
					created: '2023-04-17T12:54:34.198614Z'
				},
				{
					id: 'ccdf18ab-4ac6-45c9-bb27-5d8c549f6ab5',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'ServiceAccount/skjemautfylling (IssuedLeafCertificate): issued certificate for skjemautfylling.skjemadigitalisering.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:54:20 +0000 UTC: 63d41d892434a8b0a02186a2deb796af',
					created: '2023-04-17T12:54:00.93277Z'
				},
				{
					id: '4cce1d55-2874-4d2b-bfca-76113ace94f0',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'Deployment/skjemautfylling (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:53:51.6573Z'
				},
				{
					id: 'efc8dfcb-fafb-42df-ad42-51bbd12b631e',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Application/skjemautfylling (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:53:51.492038Z'
				},
				{
					id: '9c2d3e92-ecff-48ed-b26d-3aa5cf2433e3',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Deployment/skjemautfylling (ScalingReplicaSet): Scaled up replica set skjemautfylling-cd4fb8f4d to 1',
					created: '2023-04-17T12:53:51.380511Z'
				},
				{
					id: '9c03bea0-dd93-4f9d-bd09-476d288ddf0b',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'AzureAdApplication/skjemautfylling (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:53:51.253845Z'
				},
				{
					id: 'c57f05bd-4641-4719-826a-0e58383da294',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'IDPortenClient/skjemautfylling (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:53:50.870999Z'
				},
				{
					id: '7697aed1-e738-42c6-b8c2-620dd2fc29ce',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:53:50.390836Z'
				},
				{
					id: 'd3a0f26e-b985-4760-a6ca-fcc5bc698d21',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=skjemadigitalisering, Name=skjemautfylling',
					created: '2023-04-17T12:53:50.390819Z'
				},
				{
					id: '034dcb5a-2492-45e8-ab45-77205c18b224',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:53:50.045322Z'
				}
			],
			resources: [
				{
					id: 'c4acf906-3fdf-4d1a-bec0-5d967248cf8a',
					deploymentID: '6d29cf58-e815-4dc5-81d8-175746b5089b',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'skjemautfylling',
					namespace: 'skjemadigitalisering'
				}
			]
		},
		{
			deployment: {
				id: '94250c60-2aeb-451b-b880-3369d9508abf',
				team: 'teampensjon',
				created: '2023-04-17T12:53:36.782442Z',
				githubID: 871339271,
				githubRepository: 'navikt/pesys',
				cluster: 'dev-fss',
				state: null
			},
			statuses: [
				{
					id: '805841eb-bded-4518-9140-08a3b524ed35',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:56:24.969624Z'
				},
				{
					id: '3a6ea8aa-06db-41ab-93e0-9ebffec2ccee',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message: 'Application/pensjon-pen-q0 (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:56:24.969491Z'
				},
				{
					id: 'fbc078e1-759d-468b-aba4-73eb946587a3',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-5t8nc (Killing): Stopping container secure-logs-fluentd',
					created: '2023-04-17T12:56:23.034614Z'
				},
				{
					id: '342f7150-48a8-4002-81f6-0ed9bdc62f0b',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-5t8nc (Killing): Stopping container secure-logs-configmap-reload',
					created: '2023-04-17T12:56:23.01761Z'
				},
				{
					id: 'd404d5fa-e7b7-4542-b8b4-75a70ddca7f3',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-5t8nc (Killing): Stopping container pensjon-pen-q0',
					created: '2023-04-17T12:56:23.008749Z'
				},
				{
					id: '08c29ada-4b24-41c0-aa5f-c6f433743fb4',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'ReplicaSet/pensjon-pen-q0-7bb6474c45 (SuccessfulDelete): Deleted pod: pensjon-pen-q0-7bb6474c45-5t8nc',
					created: '2023-04-17T12:56:23.006765Z'
				},
				{
					id: 'b15adb68-1615-4d77-b6c3-3ae5d2ec412a',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen-q0 (ScalingReplicaSet): Scaled down replica set pensjon-pen-q0-7bb6474c45 to 0',
					created: '2023-04-17T12:56:22.684689Z'
				},
				{
					id: '2a8ebb6d-652a-4efb-b555-e0eafb16d762',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-whhh7 (Unhealthy): Readiness probe failed: Get "http://192.168.125.109:8080/pen/health/isReady": dial tcp 192.168.125.109:8080: connect: connection refused',
					created: '2023-04-17T12:56:15.360429Z'
				},
				{
					id: '31cfc6c6-4b97-4da1-b27b-3b08eb52ba6d',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-whhh7 (Unhealthy): Readiness probe failed: Get "http://192.168.125.109:8080/pen/health/isReady": dial tcp 192.168.125.109:8080: connect: connection refused',
					created: '2023-04-17T12:56:05.359724Z'
				},
				{
					id: 'bc019a3c-7297-4f0f-bed4-48569ec27f8a',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Started): Started container secure-logs-configmap-reload',
					created: '2023-04-17T12:55:12.306714Z'
				},
				{
					id: '34706d15-663d-4ad1-b610-8074111ab540',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Created): Created container secure-logs-configmap-reload',
					created: '2023-04-17T12:55:12.205627Z'
				},
				{
					id: 'c4435d50-207f-43d7-b2e4-7f470bf91652',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Pulled): Container image "ghcr.io/nais/configmap-reload/configmap-reload@sha256:3f30687b1200754924484a12124f7be58a55816661d864f6d1bf44e1131b6de6" already present on machine',
					created: '2023-04-17T12:55:12.192123Z'
				},
				{
					id: '4375f227-0962-4103-b5e0-5e97479f5b30',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Started): Started container secure-logs-fluentd',
					created: '2023-04-17T12:55:12.179713Z'
				},
				{
					id: 'a52fc691-171b-4eca-b823-6956503679d7',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Created): Created container secure-logs-fluentd',
					created: '2023-04-17T12:55:12.07213Z'
				},
				{
					id: 'e0831d8f-373f-48c6-baa9-660d25952fb5',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/nais-logd:107" already present on machine',
					created: '2023-04-17T12:55:12.05463Z'
				},
				{
					id: '3d4c9688-be51-45c9-81ff-6a8ed9267195',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Started): Started container pensjon-pen-q0',
					created: '2023-04-17T12:55:12.042615Z'
				},
				{
					id: '8b300f9f-d760-4078-8000-44873f6152fb',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Created): Created container pensjon-pen-q0',
					created: '2023-04-17T12:55:11.933851Z'
				},
				{
					id: '87282f8d-d790-415a-b6ee-80ba3d5614dd',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Pulled): Successfully pulled image "ghcr.io/navikt/pesys/pen:2023.04.17-14.44-73c654c13421" in 8.42141765s',
					created: '2023-04-17T12:55:11.841306Z'
				},
				{
					id: '79fa9c96-baf1-4f37-a874-7eaf2229dd09',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Pulling): Pulling image "ghcr.io/navikt/pesys/pen:2023.04.17-14.44-73c654c13421"',
					created: '2023-04-17T12:55:03.417711Z'
				},
				{
					id: '7e9898f9-c4f3-418c-b156-3c42d4610b97',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message: 'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Started): Started container vks-init',
					created: '2023-04-17T12:55:02.786794Z'
				},
				{
					id: 'c6ed0911-47a8-41ff-843e-bb30bd5a88bd',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message: 'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Created): Created container vks-init',
					created: '2023-04-17T12:55:02.684766Z'
				},
				{
					id: '5e5db82a-7672-41ba-ac22-3d853249ffc7',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-8p8k2 (Pulled): Container image "docker.io/navikt/vault-sidekick:v0.3.10-26ad67d" already present on machine',
					created: '2023-04-17T12:55:02.640694Z'
				},
				{
					id: 'b8cf2ca0-9a3f-4817-a9cd-806539daf7a8',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'ReplicaSet/pensjon-pen-q0-57998475fc (SuccessfulCreate): Created pod: pensjon-pen-q0-57998475fc-8p8k2',
					created: '2023-04-17T12:55:02.147689Z'
				},
				{
					id: '8e9f572e-2e02-4696-8a72-fc59b35bab46',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-whhh7 (Killing): Stopping container secure-logs-fluentd',
					created: '2023-04-17T12:55:01.746676Z'
				},
				{
					id: 'faab18dd-038b-4b44-bb6e-2a5f79e63972',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-whhh7 (Killing): Stopping container secure-logs-configmap-reload',
					created: '2023-04-17T12:55:01.726661Z'
				},
				{
					id: '8f142b83-14e9-4754-9818-948784dc9c13',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-7bb6474c45-whhh7 (Killing): Stopping container pensjon-pen-q0',
					created: '2023-04-17T12:55:01.682719Z'
				},
				{
					id: '4c3156e5-2194-4112-8a3b-247e8ce3ab86',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'ReplicaSet/pensjon-pen-q0-7bb6474c45 (SuccessfulDelete): Deleted pod: pensjon-pen-q0-7bb6474c45-whhh7',
					created: '2023-04-17T12:55:01.669199Z'
				},
				{
					id: '2ede2279-050e-4c6a-bc5b-62c1adcb4967',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen-q0 (ScalingReplicaSet): Scaled up replica set pensjon-pen-q0-57998475fc to 2',
					created: '2023-04-17T12:55:01.455691Z'
				},
				{
					id: '2e9e9de0-c727-4835-9336-fc935dcd9222',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen-q0 (ScalingReplicaSet): Scaled down replica set pensjon-pen-q0-7bb6474c45 to 1',
					created: '2023-04-17T12:55:01.353328Z'
				},
				{
					id: '81344698-0e27-40fb-aa17-fb5f04db8019',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Started): Started container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:46.117689Z'
				},
				{
					id: '62055544-8f8d-4d07-bf40-8585b6256ed7',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Created): Created container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:46.032674Z'
				},
				{
					id: 'cd74fb56-03f1-4cd6-b973-bf3d8e5aebec',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Pulled): Container image "ghcr.io/nais/configmap-reload/configmap-reload@sha256:3f30687b1200754924484a12124f7be58a55816661d864f6d1bf44e1131b6de6" already present on machine',
					created: '2023-04-17T12:53:46.020719Z'
				},
				{
					id: 'b01f7770-2c96-4c04-ab67-f26efa63615d',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Started): Started container secure-logs-fluentd',
					created: '2023-04-17T12:53:46.005467Z'
				},
				{
					id: 'd7eeeb9f-1ace-4875-b757-160f590f0d44',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Created): Created container secure-logs-fluentd',
					created: '2023-04-17T12:53:45.90871Z'
				},
				{
					id: 'c2fd86b8-3ca2-494f-9a0c-628c91c1e849',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/nais-logd:107" already present on machine',
					created: '2023-04-17T12:53:45.894739Z'
				},
				{
					id: '8acba120-875b-42d5-bb88-263f48dacaed',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Started): Started container pensjon-pen-q0',
					created: '2023-04-17T12:53:45.884768Z'
				},
				{
					id: '75794b50-8bfc-42d4-b49b-be86b4e52ebb',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Created): Created container pensjon-pen-q0',
					created: '2023-04-17T12:53:45.778482Z'
				},
				{
					id: 'c6ff7bfc-d14c-48e5-a28b-3beda7ebaca2',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Pulled): Successfully pulled image "ghcr.io/navikt/pesys/pen:2023.04.17-14.44-73c654c13421" in 3.655911825s',
					created: '2023-04-17T12:53:45.730468Z'
				},
				{
					id: 'fa6344ed-d2fb-4e75-88a6-1a0e088d06bd',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Pulling): Pulling image "ghcr.io/navikt/pesys/pen:2023.04.17-14.44-73c654c13421"',
					created: '2023-04-17T12:53:42.037243Z'
				},
				{
					id: '7947dfbf-adaf-4a6e-aa74-cc40929f029d',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message: 'Pod/pensjon-pen-q0-57998475fc-npht8 (Started): Started container vks-init',
					created: '2023-04-17T12:53:41.003587Z'
				},
				{
					id: '11511a20-495f-42cc-b14c-60ba9bed9212',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message: 'Pod/pensjon-pen-q0-57998475fc-npht8 (Created): Created container vks-init',
					created: '2023-04-17T12:53:40.920216Z'
				},
				{
					id: 'e4c8efb1-b677-46f2-b39b-5fba6ac7a11b',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Pod/pensjon-pen-q0-57998475fc-npht8 (Pulled): Container image "docker.io/navikt/vault-sidekick:v0.3.10-26ad67d" already present on machine',
					created: '2023-04-17T12:53:40.862991Z'
				},
				{
					id: 'db2477b2-ce45-48cd-afd3-5cba2a83d0f8',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'ReplicaSet/pensjon-pen-q0-57998475fc (SuccessfulCreate): Created pod: pensjon-pen-q0-57998475fc-npht8',
					created: '2023-04-17T12:53:40.379321Z'
				},
				{
					id: '416ca196-d0e3-4b57-92d3-30a6acee83c8',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Application/pensjon-pen-q0 (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:53:39.810802Z'
				},
				{
					id: 'f079f0ab-1c5a-496a-a6fa-be5a83d1109e',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen-q0 (ScalingReplicaSet): Scaled up replica set pensjon-pen-q0-57998475fc to 1',
					created: '2023-04-17T12:53:39.771132Z'
				},
				{
					id: '5ac27402-a5dc-49e5-9fdb-556177b33197',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message: 'AzureAdApplication/pensjon-pen-q0 (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:53:39.478696Z'
				},
				{
					id: '223273c9-ff22-41dc-844c-de0fdd555c91',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:53:37.267688Z'
				},
				{
					id: '7a4cd2fa-ba0d-4833-84b1-a58c691c10f4',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=teampensjon, Name=pensjon-pen-q0',
					created: '2023-04-17T12:53:37.267676Z'
				},
				{
					id: '63b0c9ef-e2f6-4ad5-bf13-95bbffde7542',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:53:37.121384Z'
				}
			],
			resources: [
				{
					id: 'ad18c4be-b3bf-47d4-b94c-50b5045e9eb2',
					deploymentID: '94250c60-2aeb-451b-b880-3369d9508abf',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'pensjon-pen-q0',
					namespace: 'teampensjon'
				}
			]
		},
		{
			deployment: {
				id: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
				team: 'pensjondeployer',
				created: '2023-04-17T12:53:30.544491Z',
				githubID: 871339155,
				githubRepository: 'navikt/pesys',
				cluster: 'prod-fss',
				state: null
			},
			statuses: [
				{
					id: 'eb1d8062-648c-4b90-91d2-4f802c2e6f37',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen (ScalingReplicaSet): Scaled up replica set pensjon-pen-8b7ffcfc4 to 3',
					created: '2023-04-17T12:56:15.000289Z'
				},
				{
					id: 'fd4f382a-6cb6-415c-933e-e8413433e97e',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen (ScalingReplicaSet): Scaled down replica set pensjon-pen-bb8d77d94 to 2',
					created: '2023-04-17T12:56:14.897063Z'
				},
				{
					id: '4fb5d349-dcc5-4668-9a3d-fa6e61b44bd6',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen (ScalingReplicaSet): Scaled up replica set pensjon-pen-8b7ffcfc4 to 2',
					created: '2023-04-17T12:54:53.755284Z'
				},
				{
					id: '0581808a-76a6-4d4e-b669-c8ba526977b5',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen (ScalingReplicaSet): Scaled down replica set pensjon-pen-bb8d77d94 to 3',
					created: '2023-04-17T12:54:53.672304Z'
				},
				{
					id: '246fee05-abe3-4a89-8e57-195263a3ad59',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message:
						'Application/pensjon-pen (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:53:32.547567Z'
				},
				{
					id: '8790f584-69ae-41f9-a7b1-413e15def387',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message:
						'Deployment/pensjon-pen (ScalingReplicaSet): Scaled up replica set pensjon-pen-8b7ffcfc4 to 1',
					created: '2023-04-17T12:53:32.542643Z'
				},
				{
					id: '4f752fe5-5897-446b-becd-7f8fb530d5f6',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message: 'AzureAdApplication/pensjon-pen (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:53:32.266304Z'
				},
				{
					id: '5a3f6bfd-3262-47e4-800d-21d4a1553ebf',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:53:30.859394Z'
				},
				{
					id: '3ca1c6f6-6f66-4799-9455-fff56295246e',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=pensjondeployer, Name=pensjon-pen',
					created: '2023-04-17T12:53:30.859384Z'
				},
				{
					id: 'b3a55097-f88c-46b6-8e02-da48db00fbc5',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:53:30.772179Z'
				}
			],
			resources: [
				{
					id: '1a856ddf-1aab-4053-b6f7-9ea40f44f4e3',
					deploymentID: '3b515111-482d-4ef8-a7cb-28aeeb0dfb1a',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'pensjon-pen',
					namespace: 'pensjondeployer'
				}
			]
		},
		{
			deployment: {
				id: '92422265-c1ef-4f89-93b9-d182b880d49d',
				team: 'arbeidsgiver',
				created: '2023-04-17T12:52:44.529396Z',
				githubID: 871338328,
				githubRepository: 'navikt/tiltak-refusjon-arbeidsgiver',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '390e3f10-b0db-490e-84b7-3560d1fc9018',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'failure',
					message: 'this application has been redeployed, aborting monitoring (total of 1 errors)',
					created: '2023-04-17T12:52:47.409921Z'
				},
				{
					id: 'f0e9dae7-cb70-4f55-856b-9de7ed1bd69a',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'in_progress',
					message: 'this application has been redeployed, aborting monitoring',
					created: '2023-04-17T12:52:47.409689Z'
				},
				{
					id: 'cf8fb687-36e1-433f-b1bd-790b0e075b32',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (ScalingReplicaSet): Scaled up replica set tiltak-refusjon-arbeidsgiver-c6db57dff to 1',
					created: '2023-04-17T12:52:47.355113Z'
				},
				{
					id: '80ff3521-7d93-4dd1-9162-dacb2b2a4663',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (ScalingReplicaSet): Scaled down replica set tiltak-refusjon-arbeidsgiver-5979c648b9 to 0',
					created: '2023-04-17T12:52:47.317815Z'
				},
				{
					id: '49580983-61aa-4ac2-a929-e345965a6864',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'in_progress',
					message:
						'IDPortenClient/tiltak-refusjon-arbeidsgiver (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:52:47.041409Z'
				},
				{
					id: 'dacee3c3-14f3-4841-b74e-131a6597ff77',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:52:45.731228Z'
				},
				{
					id: '3e366a5d-421f-45eb-8609-30d4c35776b4',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=arbeidsgiver, Name=tiltak-refusjon-arbeidsgiver',
					created: '2023-04-17T12:52:45.731203Z'
				},
				{
					id: '5693c2fe-3e15-402b-92c5-de19e40d03da',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:52:44.848344Z'
				}
			],
			resources: [
				{
					id: '5dfb938f-a50c-41a9-8b94-eef4640be442',
					deploymentID: '92422265-c1ef-4f89-93b9-d182b880d49d',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'tiltak-refusjon-arbeidsgiver',
					namespace: 'arbeidsgiver'
				}
			]
		},
		{
			deployment: {
				id: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
				team: 'arbeidsgiver',
				created: '2023-04-17T12:52:44.464929Z',
				githubID: 871338305,
				githubRepository: 'navikt/tiltak-refusjon-arbeidsgiver',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: 'd47f5a01-0f91-43ad-b780-7baec7ac83d9',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:53:27.601534Z'
				},
				{
					id: 'fbc6b056-0113-47ca-86ae-26064d6d3341',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:53:27.601348Z'
				},
				{
					id: '41144475-f703-40ba-9478-165b02dfad2c',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Pod/tiltak-refusjon-arbeidsgiver-567948dd95-7psz6 (Killing): Stopping container tiltak-refusjon-arbeidsgiver',
					created: '2023-04-17T12:53:26.664236Z'
				},
				{
					id: '8fd453e7-132d-4da6-8b66-ec2441298c44',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Pod/tiltak-refusjon-arbeidsgiver-567948dd95-7psz6 (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:53:26.659306Z'
				},
				{
					id: '7b7c1437-1b1e-4de0-b357-d449d313e4b6',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'ReplicaSet/tiltak-refusjon-arbeidsgiver-567948dd95 (SuccessfulDelete): Deleted pod: tiltak-refusjon-arbeidsgiver-567948dd95-7psz6',
					created: '2023-04-17T12:53:26.653762Z'
				},
				{
					id: 'c15e3c5d-bdad-448e-bdca-29cbd46baa4b',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (ScalingReplicaSet): Scaled down replica set tiltak-refusjon-arbeidsgiver-567948dd95 to 0',
					created: '2023-04-17T12:53:26.342205Z'
				},
				{
					id: 'd336a94e-a18f-452a-9a88-891d87ecf8a0',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Pod/tiltak-refusjon-arbeidsgiver-5979c648b9-fr9rz (FailedMount): Unable to attach or mount volumes: unmounted volumes=[idporten-tiltak-refusjon-arbeidsgiver-053238ab], unattached volumes=[ca-bundle-jks ca-bundle-pem tokenx-tiltak-refusjon-arbeidsgiver-8u9n6s7i writable-tmp linkerd-proxy-init-xtables-lock kube-api-access-7776l linkerd-identity-end-entity idporten-tiltak-refusjon-arbeidsgiver-053238ab]: timed out waiting for the condition',
					created: '2023-04-17T12:53:16.653643Z'
				},
				{
					id: 'dabbbbc5-0490-4fb2-a7ab-9f4ed5d19e9d',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Pod/tiltak-refusjon-arbeidsgiver-567948dd95-7psz6 (FailedMount): MountVolume.SetUp failed for volume "tokenx-tiltak-refusjon-arbeidsgiver-839e8661" : secret "tokenx-tiltak-refusjon-arbeidsgiver-839e8661" not found',
					created: '2023-04-17T12:53:15.730824Z'
				},
				{
					id: '7db429a3-8f2f-4ac0-8aa6-84d77f4a594f',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'ServiceAccount/tiltak-refusjon-arbeidsgiver (IssuedLeafCertificate): issued certificate for tiltak-refusjon-arbeidsgiver.arbeidsgiver.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:53:23 +0000 UTC: 264eea56c360d06a2e7078d7e437eff9',
					created: '2023-04-17T12:53:03.869565Z'
				},
				{
					id: '9993fb36-807b-4fc3-890b-395832501de5',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'IDPortenClient/tiltak-refusjon-arbeidsgiver (Synchronized): Client is up-to-date',
					created: '2023-04-17T12:52:52.32349Z'
				},
				{
					id: 'b3404d99-3856-49ae-a17e-a41034327643',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'IDPortenClient/tiltak-refusjon-arbeidsgiver (RotatedInDigDir): Client credentials is rotated',
					created: '2023-04-17T12:52:52.279629Z'
				},
				{
					id: 'b99c4b18-4e29-4761-956c-483a6612a84a',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'IDPortenClient/tiltak-refusjon-arbeidsgiver (CreatedInDigDir): Client is registered',
					created: '2023-04-17T12:52:51.893201Z'
				},
				{
					id: '7d6c7282-945d-4fda-9110-1ff0501b52d9',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver-redis (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:52:51.460312Z'
				},
				{
					id: 'd87720b7-9a9b-4cbc-919b-ed8cf89b92e3',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'ReplicaSet/tiltak-refusjon-arbeidsgiver-5979c648b9 (SuccessfulDelete): Deleted pod: tiltak-refusjon-arbeidsgiver-5979c648b9-fr9rz',
					created: '2023-04-17T12:52:47.591107Z'
				},
				{
					id: 'a0caa955-fe3f-498d-81ff-c55d3c407027',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:52:47.512798Z'
				},
				{
					id: '0e9bd155-0c9a-46fc-b879-9cdbd912696c',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:52:47.409676Z'
				},
				{
					id: 'd1c7e093-3e3e-45cb-b138-f4400c2bb037',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (ScalingReplicaSet): Scaled up replica set tiltak-refusjon-arbeidsgiver-c6db57dff to 1',
					created: '2023-04-17T12:52:47.355099Z'
				},
				{
					id: 'c9140b9f-21d3-45b9-82f0-e065484d1d20',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Deployment/tiltak-refusjon-arbeidsgiver (ScalingReplicaSet): Scaled down replica set tiltak-refusjon-arbeidsgiver-5979c648b9 to 0',
					created: '2023-04-17T12:52:47.317696Z'
				},
				{
					id: 'b53a7f90-e5fa-4fcc-99ab-8b1a0988474c',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'IDPortenClient/tiltak-refusjon-arbeidsgiver (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:52:47.139766Z'
				},
				{
					id: '9aea090c-1186-482e-9764-94c13718fb50',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Application/tiltak-refusjon-arbeidsgiver-redis (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:52:46.932357Z'
				},
				{
					id: '114462ce-6e9e-4e7e-960b-d6ab2df31482',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:52:45.981896Z'
				},
				{
					id: '41358abc-5602-4dff-b884-9b3df7748be5',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=arbeidsgiver, Name=tiltak-refusjon-arbeidsgiver',
					created: '2023-04-17T12:52:45.981888Z'
				},
				{
					id: '9025a53d-4ad9-4f8f-b7cb-e2047c1c948c',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=arbeidsgiver, Name=tiltak-refusjon-arbeidsgiver-redis',
					created: '2023-04-17T12:52:45.423958Z'
				},
				{
					id: 'b4cabef6-19c4-4428-9b10-04e929eabee9',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:52:44.835768Z'
				}
			],
			resources: [
				{
					id: '7711a6fa-018c-4f81-8f42-08da9220291d',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'tiltak-refusjon-arbeidsgiver-redis',
					namespace: 'arbeidsgiver'
				},
				{
					id: '534f8d85-48d0-4e21-923d-64bdf04fd5e9',
					deploymentID: 'a70b17f2-9238-49d5-9c7e-402f5105a313',
					index: 1,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'tiltak-refusjon-arbeidsgiver',
					namespace: 'arbeidsgiver'
				}
			]
		},
		{
			deployment: {
				id: '77f5efce-fb23-44ac-b0c9-8048728abae3',
				team: 'toi',
				created: '2023-04-17T12:52:41.565472Z',
				githubID: 871338240,
				githubRepository: 'navikt/rekrutteringsbistand-container',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: 'cf57418b-f90b-4644-ac85-58c16417cc3c',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:53:28.928612Z'
				},
				{
					id: '523465e7-52a9-4b64-8d3d-9246fa9e9e01',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Application/rekrutteringsbistand-container (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:53:28.928461Z'
				},
				{
					id: '9eb6d6bf-5d1c-4361-86d9-2013e51aa71b',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-pk9g6 (Killing): Stopping container wonderwall',
					created: '2023-04-17T12:53:28.053719Z'
				},
				{
					id: '027a0669-3920-40a3-a534-5dd22e7aea94',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-pk9g6 (Killing): Stopping container rekrutteringsbistand-container',
					created: '2023-04-17T12:53:28.048139Z'
				},
				{
					id: '9ecb2f35-5650-43bc-89be-a385691b649b',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-pk9g6 (Killing): Stopping container secure-logs-fluentd',
					created: '2023-04-17T12:53:28.041776Z'
				},
				{
					id: '51138710-9f6d-4378-b35b-a49a0edbdc92',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-pk9g6 (Killing): Stopping container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:28.036608Z'
				},
				{
					id: 'dae7d550-b329-41d1-a294-494e6ed0b689',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-pk9g6 (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:53:28.031681Z'
				},
				{
					id: 'b89f3565-0a54-4fe6-af76-8ab9bd0f8630',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'ReplicaSet/rekrutteringsbistand-container-6b795d9b85 (SuccessfulDelete): Deleted pod: rekrutteringsbistand-container-6b795d9b85-pk9g6',
					created: '2023-04-17T12:53:28.026349Z'
				},
				{
					id: '381b2e81-64ca-468b-b3b0-189555c47f60',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Started): Started container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:23.00517Z'
				},
				{
					id: 'd8f41dd9-7be5-45d1-9fc3-a2812b7f9daf',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Created): Created container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:22.519165Z'
				},
				{
					id: 'e6b02511-7ff4-4d9f-94e8-0b5885e6ae9b',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Pulled): Container image "ghcr.io/nais/configmap-reload/configmap-reload@sha256:3f30687b1200754924484a12124f7be58a55816661d864f6d1bf44e1131b6de6" already present on machine',
					created: '2023-04-17T12:53:22.492897Z'
				},
				{
					id: 'f7bea57b-08aa-48c7-aa93-2ca2ef9a1e89',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Started): Started container secure-logs-fluentd',
					created: '2023-04-17T12:53:22.487428Z'
				},
				{
					id: 'a0a2f432-6623-4df6-98dc-792fdeea4656',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Created): Created container secure-logs-fluentd',
					created: '2023-04-17T12:53:21.950588Z'
				},
				{
					id: '6f766c98-7949-44ea-9d27-d9085e4bbcc6',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/nais-logd:107" already present on machine',
					created: '2023-04-17T12:53:21.891474Z'
				},
				{
					id: '02a82335-9f47-4409-b379-24df96df9c1d',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Started): Started container wonderwall',
					created: '2023-04-17T12:53:21.884465Z'
				},
				{
					id: 'e67188c7-905b-4049-a8be-d4d4b7bd1dd6',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Created): Created container wonderwall',
					created: '2023-04-17T12:53:21.348554Z'
				},
				{
					id: '4eced226-d30d-4ac6-8734-4788d5e1ef8f',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/wonderwall:2023-04-13-9eeb6f5" already present on machine',
					created: '2023-04-17T12:53:21.323213Z'
				},
				{
					id: '38563ebd-432b-4783-8705-2115f6f4501b',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Started): Started container rekrutteringsbistand-container',
					created: '2023-04-17T12:53:21.316359Z'
				},
				{
					id: '0565173c-3129-4bb5-a3d7-dd1556611a53',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Created): Created container rekrutteringsbistand-container',
					created: '2023-04-17T12:53:20.798864Z'
				},
				{
					id: '326bbe61-1fef-4b68-b503-9dcdc15c5a60',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Pulled): Successfully pulled image "ghcr.io/navikt/rekrutteringsbistand-container/rekrutteringsbistand-container:3f90874f449393f3cb032989d88bbba577529a22" in 4.236294867s',
					created: '2023-04-17T12:53:20.74186Z'
				},
				{
					id: '4fabd8b8-c5a9-4992-82f9-dbc9060cb204',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-5wsn8 (Unhealthy): Readiness probe failed: Get "http://10.6.65.235:8080/internal/isReady": dial tcp 10.6.65.235:8080: connect: connection refused',
					created: '2023-04-17T12:53:18.998338Z'
				},
				{
					id: '968ec1b9-9fd9-4f96-9749-32d4befeece5',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Pulling): Pulling image "ghcr.io/navikt/rekrutteringsbistand-container/rekrutteringsbistand-container:3f90874f449393f3cb032989d88bbba577529a22"',
					created: '2023-04-17T12:53:16.503582Z'
				},
				{
					id: 'ea5f0a1e-4de9-43ca-853f-bbee52c83175',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'ServiceAccount/rekrutteringsbistand-container (IssuedLeafCertificate): (combined from similar events): issued certificate for rekrutteringsbistand-container.toi.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:53:34 +0000 UTC: 9f3a4e8a22f7602c544a226d60828daa',
					created: '2023-04-17T12:53:14.899368Z'
				},
				{
					id: 'e5fc1f61-cbc4-4314-b353-3388e19dc735',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:53:14.745804Z'
				},
				{
					id: 'a7896281-2d01-475c-8ccb-4d5061022cc8',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:53:12.96926Z'
				},
				{
					id: 'df518d99-76ca-4d20-b7c7-bff962b3e75b',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:53:12.920659Z'
				},
				{
					id: '36e31289-5f68-43f9-a8e3-85a62eaf4c5f',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Started): Started container linkerd-init',
					created: '2023-04-17T12:53:11.73485Z'
				},
				{
					id: '2fad1784-7127-44fc-bc63-937cdf1d1359',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Created): Created container linkerd-init',
					created: '2023-04-17T12:53:08.292869Z'
				},
				{
					id: '7f971890-f7e3-42b5-aae1-5ad62747f578',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:53:08.25607Z'
				},
				{
					id: '5e60386d-f414-4e0f-91f9-bf25832ae169',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-2f7s4 (Scheduled): Successfully assigned toi/rekrutteringsbistand-container-575d6b86b5-2f7s4 to gke-dev-gcp-nais-pool-cd-spot-59d8a2d9-3h92',
					created: '2023-04-17T12:53:07.257347Z'
				},
				{
					id: 'c080dea6-8ddf-4d5d-a14e-bcd185368221',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'ReplicaSet/rekrutteringsbistand-container-575d6b86b5 (SuccessfulCreate): Created pod: rekrutteringsbistand-container-575d6b86b5-2f7s4',
					created: '2023-04-17T12:53:07.250202Z'
				},
				{
					id: 'cc595070-73cc-42fa-ae9b-e154d7d40caa',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Deployment/rekrutteringsbistand-container (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:53:06.181878Z'
				},
				{
					id: '1bc582d2-31b6-4ed5-9bd1-9423af9e5229',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-5wsn8 (Killing): Stopping container secure-logs-fluentd',
					created: '2023-04-17T12:53:06.084605Z'
				},
				{
					id: 'ca2f2923-9bd3-4c7d-b591-28219f349dec',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-5wsn8 (Killing): Stopping container rekrutteringsbistand-container',
					created: '2023-04-17T12:53:06.079157Z'
				},
				{
					id: '05255cc5-8aff-449a-bbc1-d9dac6b93817',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-5wsn8 (Killing): Stopping container wonderwall',
					created: '2023-04-17T12:53:06.073554Z'
				},
				{
					id: '3d65083c-988e-4eed-844e-7dd10515d3eb',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-5wsn8 (Killing): Stopping container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:06.066398Z'
				},
				{
					id: 'e4cf3621-c429-44fd-a195-f450110c0849',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-6b795d9b85-5wsn8 (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:53:06.061254Z'
				},
				{
					id: 'b26ba6a1-7ac2-4d7b-9f89-5a31caa8a3c2',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'ReplicaSet/rekrutteringsbistand-container-6b795d9b85 (SuccessfulDelete): Deleted pod: rekrutteringsbistand-container-6b795d9b85-5wsn8',
					created: '2023-04-17T12:53:06.058828Z'
				},
				{
					id: '3dd92b9e-b8d5-4329-b9f0-2accd71db209',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Started): Started container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:01.48527Z'
				},
				{
					id: '764857bb-0e5e-435c-89b6-f646061f308d',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Created): Created container secure-logs-configmap-reload',
					created: '2023-04-17T12:53:00.953001Z'
				},
				{
					id: '1828f7bd-9a9b-41d0-bd39-0f402f077eff',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Pulled): Container image "ghcr.io/nais/configmap-reload/configmap-reload@sha256:3f30687b1200754924484a12124f7be58a55816661d864f6d1bf44e1131b6de6" already present on machine',
					created: '2023-04-17T12:53:00.926764Z'
				},
				{
					id: '87e8830c-0822-468d-b2e2-924dfe77c43a',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Started): Started container secure-logs-fluentd',
					created: '2023-04-17T12:53:00.919144Z'
				},
				{
					id: '477c6747-09f7-4ae8-80dd-03f846180c20',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Created): Created container secure-logs-fluentd',
					created: '2023-04-17T12:53:00.361728Z'
				},
				{
					id: '7fbe0780-202a-4214-baa3-835742c30251',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/nais-logd:107" already present on machine',
					created: '2023-04-17T12:53:00.328843Z'
				},
				{
					id: 'e273a602-916e-465f-b886-f09a43d33a23',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Started): Started container wonderwall',
					created: '2023-04-17T12:53:00.320566Z'
				},
				{
					id: 'a664042c-8aa1-43c1-bfc5-f7f1d7ccdd4f',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Created): Created container wonderwall',
					created: '2023-04-17T12:52:59.799136Z'
				},
				{
					id: '30f419e9-6bba-4730-9304-93c8db90796a',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/wonderwall:2023-04-13-9eeb6f5" already present on machine',
					created: '2023-04-17T12:52:59.774332Z'
				},
				{
					id: '61877a79-48b6-4a8e-a6e1-5365706b71e3',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Started): Started container rekrutteringsbistand-container',
					created: '2023-04-17T12:52:59.769513Z'
				},
				{
					id: '2f2aa71c-2852-45a5-b1cc-36a49a6d9b2f',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Created): Created container rekrutteringsbistand-container',
					created: '2023-04-17T12:52:59.260742Z'
				},
				{
					id: 'd7d8b3a6-f112-4267-ae3f-92d077cd8695',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Pulled): Successfully pulled image "ghcr.io/navikt/rekrutteringsbistand-container/rekrutteringsbistand-container:3f90874f449393f3cb032989d88bbba577529a22" in 4.923693327s',
					created: '2023-04-17T12:52:59.208387Z'
				},
				{
					id: 'c0021053-0ad8-4a31-b621-e99b3bf2c2a6',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Pulling): Pulling image "ghcr.io/navikt/rekrutteringsbistand-container/rekrutteringsbistand-container:3f90874f449393f3cb032989d88bbba577529a22"',
					created: '2023-04-17T12:52:54.286126Z'
				},
				{
					id: 'd18c69c1-56e6-4194-ac4c-e9944fa7741c',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'ServiceAccount/rekrutteringsbistand-container (IssuedLeafCertificate): issued certificate for rekrutteringsbistand-container.toi.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:53:12 +0000 UTC: de81627e8601766ac0336de5e1259b2d',
					created: '2023-04-17T12:52:52.769226Z'
				},
				{
					id: 'd4b3d5cd-930f-48bb-b216-6a4c4425f763',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:52:52.610725Z'
				},
				{
					id: '451db76d-e7d9-437d-9525-07eb0a679127',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:52:50.764154Z'
				},
				{
					id: '656bf312-d09d-4983-843f-742adea9013d',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:52:50.726645Z'
				},
				{
					id: '54980ecf-007b-462b-8404-f7c90589619d',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Started): Started container linkerd-init',
					created: '2023-04-17T12:52:49.810388Z'
				},
				{
					id: 'df0bbb26-93be-4f1d-884a-7b047a3e75d0',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Created): Created container linkerd-init',
					created: '2023-04-17T12:52:46.233475Z'
				},
				{
					id: '77fb6e03-1ad6-42a7-8772-52962a939715',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:52:46.23341Z'
				},
				{
					id: '62f23a9f-5097-428c-bc18-6785f6234cc6',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Pod/rekrutteringsbistand-container-575d6b86b5-ls295 (Scheduled): Successfully assigned toi/rekrutteringsbistand-container-575d6b86b5-ls295 to gke-dev-gcp-nais-pool-cd-spot-6a842aac-nt7v',
					created: '2023-04-17T12:52:45.342792Z'
				},
				{
					id: '4c1e372d-4c5f-432d-b9c2-560521549ba3',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'ReplicaSet/rekrutteringsbistand-container-575d6b86b5 (SuccessfulCreate): Created pod: rekrutteringsbistand-container-575d6b86b5-ls295',
					created: '2023-04-17T12:52:45.235402Z'
				},
				{
					id: '553ba54d-9225-4b55-9419-5c6be7b01afd',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Deployment/rekrutteringsbistand-container (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:52:44.0981Z'
				},
				{
					id: 'f98ffc77-7fbe-4933-a889-19a7d81f061b',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Application/rekrutteringsbistand-container (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:52:43.727027Z'
				},
				{
					id: '2a83ab06-027c-41b3-9b41-c87a2fe32cce',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Deployment/rekrutteringsbistand-container (ScalingReplicaSet): (combined from similar events): Scaled up replica set rekrutteringsbistand-container-575d6b86b5 to 1',
					created: '2023-04-17T12:52:43.622624Z'
				},
				{
					id: '5e794a48-d318-44cf-8ea9-e01054dd5033',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'AzureAdApplication/rekrutteringsbistand-container (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:52:43.430682Z'
				},
				{
					id: '64d9fe86-9d74-4089-9ebc-ad1b3aa9463d',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:52:42.130821Z'
				},
				{
					id: 'ba1ea905-6036-4296-918c-20238b924a15',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=toi, Name=rekrutteringsbistand-container',
					created: '2023-04-17T12:52:42.13078Z'
				},
				{
					id: 'c39026c5-c32f-4e40-a070-1daf59eaccbe',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:52:41.891061Z'
				}
			],
			resources: [
				{
					id: '51fe7d30-3b18-4240-b914-103636748a69',
					deploymentID: '77f5efce-fb23-44ac-b0c9-8048728abae3',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'rekrutteringsbistand-container',
					namespace: 'toi'
				}
			]
		},
		{
			deployment: {
				id: '49fa853b-f959-4727-8335-55717ffbe446',
				team: 'personbruker',
				created: '2023-04-17T12:52:22.491005Z',
				githubID: 871337782,
				githubRepository: 'navikt/nav-enonicxp',
				cluster: 'prod-gcp',
				state: null
			},
			statuses: [
				{
					id: 'e10be936-1c27-4d50-8ca6-15150560296f',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:52:48.795368Z'
				},
				{
					id: '57358971-8b8b-4825-9dc6-be2c5708eba4',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Naisjob/xp-navno-deploy (RolloutComplete): Job finished successfully',
					created: '2023-04-17T12:52:48.794865Z'
				},
				{
					id: '44c00488-08af-4634-84ce-a873b2e94dcb',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Job/xp-navno-deploy (Completed): Job completed',
					created: '2023-04-17T12:52:48.510316Z'
				},
				{
					id: 'c20ac2c1-febb-4e5b-b41a-976b95f2cbf0',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Pod/xp-navno-deploy-j67bt (Unhealthy): Readiness probe failed: Get "http://10.7.86.94:4191/ready": dial tcp 10.7.86.94:4191: connect: connection refused',
					created: '2023-04-17T12:52:44.52696Z'
				},
				{
					id: '2a122946-2e00-40d3-bd28-92511e649019',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Pod/xp-navno-deploy-j67bt (Unhealthy): Liveness probe failed: Get "http://10.7.86.94:4191/live": dial tcp 10.7.86.94:4191: connect: connection refused',
					created: '2023-04-17T12:52:44.520797Z'
				},
				{
					id: 'ee9e11e2-93e4-4886-a7e0-eb14b9f38f51',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Pod/xp-navno-deploy-j67bt (Started): Started container xp-navno-deploy',
					created: '2023-04-17T12:52:36.794922Z'
				},
				{
					id: 'b256fd4b-a737-4ff6-854e-2d420318ab78',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Pod/xp-navno-deploy-j67bt (Created): Created container xp-navno-deploy',
					created: '2023-04-17T12:52:36.018576Z'
				},
				{
					id: 'c8441d49-0423-4e1b-a811-88e9dc35fa41',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Pod/xp-navno-deploy-j67bt (Pulled): Successfully pulled image "ghcr.io/navikt/nav-enonicxp:prod-release-v2.34.36-cf9bcaab9247c779469f2b0afc448bdb87ad6efc" in 3.116809417s',
					created: '2023-04-17T12:52:35.954001Z'
				},
				{
					id: '10b536e1-e5d0-4309-a508-f94f31f91e96',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Pod/xp-navno-deploy-j67bt (Pulling): Pulling image "ghcr.io/navikt/nav-enonicxp:prod-release-v2.34.36-cf9bcaab9247c779469f2b0afc448bdb87ad6efc"',
					created: '2023-04-17T12:52:32.836689Z'
				},
				{
					id: 'b1332352-e0c1-45cc-b1f2-55e56a9b717e',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'ServiceAccount/xp-navno-deploy (IssuedLeafCertificate): issued certificate for xp-navno-deploy.personbruker.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:52:51 +0000 UTC: 026289f9cd27ba01c528f92b19e7f90d',
					created: '2023-04-17T12:52:31.339436Z'
				},
				{
					id: '906ffa52-19da-4937-908d-e4ec4bdd3d88',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Pod/xp-navno-deploy-j67bt (Started): Started container linkerd-proxy',
					created: '2023-04-17T12:52:31.073888Z'
				},
				{
					id: '0817ecbc-1b8f-4aa1-948d-1925c0fd528e',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Pod/xp-navno-deploy-j67bt (Created): Created container linkerd-proxy',
					created: '2023-04-17T12:52:29.374563Z'
				},
				{
					id: '9709d456-0a83-4046-9708-d5e3d38ff64a',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Pod/xp-navno-deploy-j67bt (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy:stable-2.11.5" already present on machine',
					created: '2023-04-17T12:52:29.341864Z'
				},
				{
					id: 'c001c122-1059-4729-9ef2-615f9d0dfefb',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Pod/xp-navno-deploy-j67bt (Started): Started container linkerd-init',
					created: '2023-04-17T12:52:28.666826Z'
				},
				{
					id: '5c8e16d6-3c11-43d1-b3df-8b6541c9f71e',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Pod/xp-navno-deploy-j67bt (Created): Created container linkerd-init',
					created: '2023-04-17T12:52:25.263569Z'
				},
				{
					id: '5799ccc2-bd81-4c6a-9559-7f5f7e3ae6f4',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Pod/xp-navno-deploy-j67bt (Pulled): Container image "europe-north1-docker.pkg.dev/nais-io/nais/images/linkerd-proxy-init:v1.5.3" already present on machine',
					created: '2023-04-17T12:52:25.227071Z'
				},
				{
					id: '590aab3a-878a-4661-856c-c05ee9117c41',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Pod/xp-navno-deploy-j67bt (Scheduled): Successfully assigned personbruker/xp-navno-deploy-j67bt to gke-prod-gcp-nais-pool-cd-2-34e9f59b-ttq9',
					created: '2023-04-17T12:52:24.196481Z'
				},
				{
					id: 'e956806a-2340-4945-9cb7-63f644d7c960',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'Job/xp-navno-deploy (SuccessfulCreate): Created pod: xp-navno-deploy-j67bt',
					created: '2023-04-17T12:52:24.184738Z'
				},
				{
					id: 'ad135f9a-0f18-48e7-b221-f2d7106dc76a',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Naisjob/xp-navno-deploy (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:52:23.636333Z'
				},
				{
					id: '77307786-29fd-40da-9a41-615aaa9be1d7',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:52:23.089606Z'
				},
				{
					id: '65b9f39b-b109-4d71-ab0b-2d4bfa975fed',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1, Kind=Naisjob, Namespace=personbruker, Name=xp-navno-deploy',
					created: '2023-04-17T12:52:23.089583Z'
				},
				{
					id: 'db762a78-ea89-4104-83e2-9ee15fa06ef8',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:52:22.752761Z'
				}
			],
			resources: [
				{
					id: '0d7210ed-7153-477f-9787-adc5d9f83d26',
					deploymentID: '49fa853b-f959-4727-8335-55717ffbe446',
					index: 0,
					group: 'nais.io',
					version: 'v1',
					kind: 'Naisjob',
					name: 'xp-navno-deploy',
					namespace: 'personbruker'
				}
			]
		},
		{
			deployment: {
				id: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
				team: 'eessipensjon',
				created: '2023-04-17T12:51:23.403275Z',
				githubID: 871336460,
				githubRepository: 'navikt/eessi-pensjon-pdl-produsent',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '4bf1d5c9-650a-4add-8402-c0cc9e76b15e',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:52:11.454021Z'
				},
				{
					id: '084ab3c1-3952-4a7a-ba76-dfca2d802d94',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Application/eessi-pensjon-pdl-produsent-q2 (RolloutComplete): Rollout has completed',
					created: '2023-04-17T12:52:11.453854Z'
				},
				{
					id: '6d6d0315-4619-4a08-a1d5-1ed954720a64',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Pod/eessi-pensjon-pdl-produsent-q2-75f47987d9-gp9lt (Killing): Stopping container secure-logs-configmap-reload',
					created: '2023-04-17T12:52:08.503207Z'
				},
				{
					id: 'aa2f44cb-b3d8-4151-9273-6f20dcee06d2',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Pod/eessi-pensjon-pdl-produsent-q2-75f47987d9-gp9lt (Killing): Stopping container secure-logs-fluentd',
					created: '2023-04-17T12:52:08.499167Z'
				},
				{
					id: 'f4213346-8608-4eed-9c7c-5ce660c25ac8',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Pod/eessi-pensjon-pdl-produsent-q2-75f47987d9-gp9lt (Killing): Stopping container eessi-pensjon-pdl-produsent-q2',
					created: '2023-04-17T12:52:08.494366Z'
				},
				{
					id: 'cd2e9dc6-8093-49ca-8df1-94a8d54e376d',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Pod/eessi-pensjon-pdl-produsent-q2-75f47987d9-gp9lt (Killing): Stopping container linkerd-proxy',
					created: '2023-04-17T12:52:08.490108Z'
				},
				{
					id: '497ac8c5-2034-474c-ae1b-e965a5838073',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'ReplicaSet/eessi-pensjon-pdl-produsent-q2-75f47987d9 (SuccessfulDelete): Deleted pod: eessi-pensjon-pdl-produsent-q2-75f47987d9-gp9lt',
					created: '2023-04-17T12:52:08.484656Z'
				},
				{
					id: 'd1b0c500-9021-481a-b36b-b056a00b5205',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Deployment/eessi-pensjon-pdl-produsent-q2 (ScalingReplicaSet): Scaled down replica set eessi-pensjon-pdl-produsent-q2-75f47987d9 to 0',
					created: '2023-04-17T12:52:08.143952Z'
				},
				{
					id: '854a8b2b-df03-45ea-b364-b4ddc2a1ff9b',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'ServiceAccount/eessi-pensjon-pdl-produsent-q2 (IssuedLeafCertificate): issued certificate for eessi-pensjon-pdl-produsent-q2.eessipensjon.serviceaccount.identity.linkerd.cluster.local until 2023-04-18 12:51:54 +0000 UTC: 51db658b86c0978cb5020e6e86433c5f',
					created: '2023-04-17T12:51:34.432932Z'
				},
				{
					id: '86b7882e-adb4-4ecb-ad37-bbb7b3307578',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Deployment/eessi-pensjon-pdl-produsent-q2 (Injected): Linkerd sidecar proxy injected',
					created: '2023-04-17T12:51:26.492668Z'
				},
				{
					id: 'd5ed58af-8084-466a-bdd2-64e7e8975c77',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Application/eessi-pensjon-pdl-produsent-q2 (Synchronized): Successfully synchronized all application resources',
					created: '2023-04-17T12:51:26.206856Z'
				},
				{
					id: '92dbc7da-a3d6-4af4-aee3-b8732d5480e5',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Deployment/eessi-pensjon-pdl-produsent-q2 (ScalingReplicaSet): Scaled up replica set eessi-pensjon-pdl-produsent-q2-b854d995c to 1',
					created: '2023-04-17T12:51:26.028399Z'
				},
				{
					id: '2df722e0-d0fc-48e8-8395-7cbd852b4b8b',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'AzureAdApplication/eessi-pensjon-pdl-produsent-q2 (AddedFinalizer): Object finalizer is added',
					created: '2023-04-17T12:51:25.307162Z'
				},
				{
					id: '19f15670-f610-426b-9f9f-5437f96dc683',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:51:24.002393Z'
				},
				{
					id: 'b7f1bf40-613f-4a75-93db-2c6f60d35093',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'in_progress',
					message:
						'Successfully applied nais.io/v1alpha1, Kind=Application, Namespace=eessipensjon, Name=eessi-pensjon-pdl-produsent-q2',
					created: '2023-04-17T12:51:24.002377Z'
				},
				{
					id: '244eb0c6-38dd-4e30-aed9-6ba695cc96dd',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:51:23.73175Z'
				}
			],
			resources: [
				{
					id: '4449e1ed-d79d-4f74-859c-5721d46bbc60',
					deploymentID: 'd919d4c3-4683-4cb3-8f00-aa834444ee1a',
					index: 0,
					group: 'nais.io',
					version: 'v1alpha1',
					kind: 'Application',
					name: 'eessi-pensjon-pdl-produsent-q2',
					namespace: 'eessipensjon'
				}
			]
		},
		{
			deployment: {
				id: '1a094e33-20c6-455f-91c5-2db438a0b81c',
				team: 'fyllut-sendinn',
				created: '2023-04-17T12:50:50.930009Z',
				githubID: 871335818,
				githubRepository: 'navikt/fyllut-sendinn-alerts',
				cluster: 'dev-gcp',
				state: null
			},
			statuses: [
				{
					id: '3f12f8b7-bbc4-4085-9ed0-e79663c5a9d3',
					deploymentID: '1a094e33-20c6-455f-91c5-2db438a0b81c',
					status: 'success',
					message: 'Deployment completed successfully.',
					created: '2023-04-17T12:50:51.35076Z'
				},
				{
					id: '825ac5c4-f289-4ac5-94a5-baf024834639',
					deploymentID: '1a094e33-20c6-455f-91c5-2db438a0b81c',
					status: 'in_progress',
					message: 'All resources saved to Kubernetes; waiting for completion',
					created: '2023-04-17T12:50:51.3503Z'
				},
				{
					id: '1289197e-fc24-4307-81bb-874ebf1bdf6c',
					deploymentID: '1a094e33-20c6-455f-91c5-2db438a0b81c',
					status: 'in_progress',
					message:
						'Successfully applied monitoring.coreos.com/v1alpha1, Kind=AlertmanagerConfig, Namespace=fyllut-sendinn, Name=fyllut-sendinn-slack-alertmanager',
					created: '2023-04-17T12:50:51.350293Z'
				},
				{
					id: '2bf6c2c1-56fc-45ae-8d72-0adbf688afbf',
					deploymentID: '1a094e33-20c6-455f-91c5-2db438a0b81c',
					status: 'queued',
					message: 'Deployment request has been put on the queue for further processing.',
					created: '2023-04-17T12:50:51.116897Z'
				}
			],
			resources: [
				{
					id: '7e944169-6a96-4dfa-bf4b-826ad47d501c',
					deploymentID: '1a094e33-20c6-455f-91c5-2db438a0b81c',
					index: 0,
					group: 'monitoring.coreos.com',
					version: 'v1alpha1',
					kind: 'AlertmanagerConfig',
					name: 'fyllut-sendinn-slack-alertmanager',
					namespace: 'fyllut-sendinn'
				}
			]
		}
	]
