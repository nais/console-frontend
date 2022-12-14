-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Backend.Mutation exposing (..)

import Backend.Enum.TeamRole
import Backend.InputObject
import Backend.Interface
import Backend.Object
import Backend.Scalar
import Backend.ScalarCodecs
import Backend.Union
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode exposing (Decoder)


type alias SetGitHubTeamSlugRequiredArguments =
    { teamSlug : Backend.ScalarCodecs.Slug
    , gitHubTeamSlug : Backend.ScalarCodecs.Slug
    }


{-| Set the GitHub team slug for a Console team.

  - teamSlug - The slug for the Console team.
  - gitHubTeamSlug - The slug for the connected GitHub team.

-}
setGitHubTeamSlug :
    SetGitHubTeamSlugRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
setGitHubTeamSlug requiredArgs____ object____ =
    Object.selectionForCompositeField "setGitHubTeamSlug" [ Argument.required "teamSlug" requiredArgs____.teamSlug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "gitHubTeamSlug" requiredArgs____.gitHubTeamSlug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug) ] object____ Basics.identity


type alias SetGoogleWorkspaceGroupEmailRequiredArguments =
    { teamSlug : Backend.ScalarCodecs.Slug
    , googleWorkspaceGroupEmail : String
    }


{-| Set the Google Workspace group email for a Console team.

  - teamSlug - The slug for the Console team.
  - googleWorkspaceGroupEmail - The email for the connected Google workspace group.

-}
setGoogleWorkspaceGroupEmail :
    SetGoogleWorkspaceGroupEmailRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
setGoogleWorkspaceGroupEmail requiredArgs____ object____ =
    Object.selectionForCompositeField "setGoogleWorkspaceGroupEmail" [ Argument.required "teamSlug" requiredArgs____.teamSlug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "googleWorkspaceGroupEmail" requiredArgs____.googleWorkspaceGroupEmail Encode.string ] object____ Basics.identity


type alias SetAzureADGroupIdRequiredArguments =
    { teamSlug : Backend.ScalarCodecs.Slug
    , azureADGroupId : Backend.ScalarCodecs.Uuid
    }


{-| Set the Azure AD group ID for a Console team.

  - teamSlug - The slug for the Console team.
  - azureADGroupId - The UUID for the connected Azure AD group.

-}
setAzureADGroupId :
    SetAzureADGroupIdRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
setAzureADGroupId requiredArgs____ object____ =
    Object.selectionForCompositeField "setAzureADGroupId" [ Argument.required "teamSlug" requiredArgs____.teamSlug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "azureADGroupId" requiredArgs____.azureADGroupId (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecUuid) ] object____ Basics.identity


type alias SetGcpProjectIdRequiredArguments =
    { teamSlug : Backend.ScalarCodecs.Slug
    , gcpEnvironment : String
    , gcpProjectId : String
    }


{-| Set the GCP project ID for a Console team in a specific environment.

  - teamSlug - The slug for the Console team.
  - gcpEnvironment - The environment for the GCP project.
  - gcpProjectId - The project ID for the connected GCP project.

-}
setGcpProjectId :
    SetGcpProjectIdRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
setGcpProjectId requiredArgs____ object____ =
    Object.selectionForCompositeField "setGcpProjectId" [ Argument.required "teamSlug" requiredArgs____.teamSlug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "gcpEnvironment" requiredArgs____.gcpEnvironment Encode.string, Argument.required "gcpProjectId" requiredArgs____.gcpProjectId Encode.string ] object____ Basics.identity


type alias SetNaisNamespaceRequiredArguments =
    { teamSlug : Backend.ScalarCodecs.Slug
    , gcpEnvironment : String
    , naisNamespace : Backend.ScalarCodecs.Slug
    }


{-| Set the NAIS namespace for a Console team in a specific environment.

  - teamSlug - The slug for the Console team.
  - gcpEnvironment - The environment for the namespace.
  - naisNamespace - The namespace.

-}
setNaisNamespace :
    SetNaisNamespaceRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
setNaisNamespace requiredArgs____ object____ =
    Object.selectionForCompositeField "setNaisNamespace" [ Argument.required "teamSlug" requiredArgs____.teamSlug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "gcpEnvironment" requiredArgs____.gcpEnvironment Encode.string, Argument.required "naisNamespace" requiredArgs____.naisNamespace (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug) ] object____ Basics.identity


type alias EnableReconcilerRequiredArguments =
    { name : Backend.ScalarCodecs.ReconcilerName }


{-| Enable a reconciler

A reconciler must be fully configured before it can be enabled.

  - name - The name of the reconciler to enable.

-}
enableReconciler :
    EnableReconcilerRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Reconciler
    -> SelectionSet decodesTo RootMutation
enableReconciler requiredArgs____ object____ =
    Object.selectionForCompositeField "enableReconciler" [ Argument.required "name" requiredArgs____.name (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecReconcilerName) ] object____ Basics.identity


type alias DisableReconcilerRequiredArguments =
    { name : Backend.ScalarCodecs.ReconcilerName }


{-| Disable a reconciler

The reconciler configuration will be left intact.

  - name - The name of the reconciler to disable.

-}
disableReconciler :
    DisableReconcilerRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Reconciler
    -> SelectionSet decodesTo RootMutation
disableReconciler requiredArgs____ object____ =
    Object.selectionForCompositeField "disableReconciler" [ Argument.required "name" requiredArgs____.name (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecReconcilerName) ] object____ Basics.identity


type alias ConfigureReconcilerRequiredArguments =
    { name : Backend.ScalarCodecs.ReconcilerName
    , config : List Backend.InputObject.ReconcilerConfigInput
    }


{-| Configure a reconciler.

  - name - The name of the reconciler to configure.
  - config - List of reconciler config inputs.

-}
configureReconciler :
    ConfigureReconcilerRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Reconciler
    -> SelectionSet decodesTo RootMutation
configureReconciler requiredArgs____ object____ =
    Object.selectionForCompositeField "configureReconciler" [ Argument.required "name" requiredArgs____.name (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecReconcilerName), Argument.required "config" requiredArgs____.config (Backend.InputObject.encodeReconcilerConfigInput |> Encode.list) ] object____ Basics.identity


type alias ResetReconcilerRequiredArguments =
    { name : Backend.ScalarCodecs.ReconcilerName }


{-| Reset all reconciler configuration options to their initial state and disable the reconciler if it is currently enabled.

  - name - The name of the reconciler to reset.

-}
resetReconciler :
    ResetReconcilerRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Reconciler
    -> SelectionSet decodesTo RootMutation
resetReconciler requiredArgs____ object____ =
    Object.selectionForCompositeField "resetReconciler" [ Argument.required "name" requiredArgs____.name (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecReconcilerName) ] object____ Basics.identity


type alias CreateTeamRequiredArguments =
    { input : Backend.InputObject.CreateTeamInput }


{-| Create a new team

The user creating the team will be granted team ownership, unless the user is a service account, in which case the team will not get an initial owner. To add one or more owners to the team, refer to the `addTeamOwners` mutation.

The new team will be returned on success.

  - input - Input for creation of the new team.

-}
createTeam :
    CreateTeamRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
createTeam requiredArgs____ object____ =
    Object.selectionForCompositeField "createTeam" [ Argument.required "input" requiredArgs____.input Backend.InputObject.encodeCreateTeamInput ] object____ Basics.identity


type alias UpdateTeamRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug
    , input : Backend.InputObject.UpdateTeamInput
    }


{-| Update an existing team

This mutation can be used to update the team purpose. It is not possible to update the team slug.

The updated team will be returned on success.

  - slug - Slug of the team to update.
  - input - Input for updating the team.

-}
updateTeam :
    UpdateTeamRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
updateTeam requiredArgs____ object____ =
    Object.selectionForCompositeField "updateTeam" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "input" requiredArgs____.input Backend.InputObject.encodeUpdateTeamInput ] object____ Basics.identity


type alias RemoveUsersFromTeamRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug
    , userIds : List Backend.ScalarCodecs.Uuid
    }


{-| Remove one or more users from a team

The updated team will be returned on success.

  - slug - Team slug that users should be removed from.
  - userIds - List of user IDs that should be removed from the team.

-}
removeUsersFromTeam :
    RemoveUsersFromTeamRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
removeUsersFromTeam requiredArgs____ object____ =
    Object.selectionForCompositeField "removeUsersFromTeam" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "userIds" requiredArgs____.userIds ((Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecUuid) |> Encode.list) ] object____ Basics.identity


type alias SynchronizeTeamRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug }


{-| Manually synchronize a team

This action will trigger a full synchronization of the team against the configured third party systems. The action
is asynchronous.

The team will be returned.

  - slug - The slug of the team to synchronize.

-}
synchronizeTeam :
    SynchronizeTeamRequiredArguments
    -> SelectionSet decodesTo Backend.Object.TeamSync
    -> SelectionSet decodesTo RootMutation
synchronizeTeam requiredArgs____ object____ =
    Object.selectionForCompositeField "synchronizeTeam" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug) ] object____ Basics.identity


type alias AddTeamMembersRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug
    , userIds : List Backend.ScalarCodecs.Uuid
    }


{-| Add users to a team as regular team members

If one or more users are already added to the team they will not be updated. If a user is already an owner of the
team the user will not lose ownership. Regular team members will get read-only access to the team.

The updated team will be returned on success.

  - slug - Slug of the team that should receive new members.
  - userIds - List of user IDs that should be added to the team as members.

-}
addTeamMembers :
    AddTeamMembersRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
addTeamMembers requiredArgs____ object____ =
    Object.selectionForCompositeField "addTeamMembers" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "userIds" requiredArgs____.userIds ((Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecUuid) |> Encode.list) ] object____ Basics.identity


type alias AddTeamOwnersRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug
    , userIds : List Backend.ScalarCodecs.Uuid
    }


{-| Add users to a team as team owners

If one or more users are already added to the team, they will be granted ownership of the team. If one or more users
are already owners of the team, they will not be updated. Team owners will get read/write access to the team.

The updated team will be returned on success.

  - slug - Slug of the team that should receive new owners.
  - userIds - List of user IDs that should be added to the team as owners.

-}
addTeamOwners :
    AddTeamOwnersRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
addTeamOwners requiredArgs____ object____ =
    Object.selectionForCompositeField "addTeamOwners" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "userIds" requiredArgs____.userIds ((Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecUuid) |> Encode.list) ] object____ Basics.identity


type alias SetTeamMemberRoleRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug
    , userId : Backend.ScalarCodecs.Uuid
    , role : Backend.Enum.TeamRole.TeamRole
    }


{-| Set the member role of a user in a team

The user must already exist in the team for this mutation to succeed.

The team will be returned on success.

  - slug - The slug of the team.
  - userId - The ID of the user.
  - role - The team role to set.

-}
setTeamMemberRole :
    SetTeamMemberRoleRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
setTeamMemberRole requiredArgs____ object____ =
    Object.selectionForCompositeField "setTeamMemberRole" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug), Argument.required "userId" requiredArgs____.userId (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecUuid), Argument.required "role" requiredArgs____.role (Encode.enum Backend.Enum.TeamRole.toString) ] object____ Basics.identity


type alias DisableTeamRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug }


{-| Disable a team

When a team is disabled it will no longer be included during team reconciliation.

The team will be returned on success.

  - slug - The slug of the team to disable.

-}
disableTeam :
    DisableTeamRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
disableTeam requiredArgs____ object____ =
    Object.selectionForCompositeField "disableTeam" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug) ] object____ Basics.identity


type alias EnableTeamRequiredArguments =
    { slug : Backend.ScalarCodecs.Slug }


{-| Enable a previously disabled team

The team will be returned on success.

  - slug - The slug of the team to enable.

-}
enableTeam :
    EnableTeamRequiredArguments
    -> SelectionSet decodesTo Backend.Object.Team
    -> SelectionSet decodesTo RootMutation
enableTeam requiredArgs____ object____ =
    Object.selectionForCompositeField "enableTeam" [ Argument.required "slug" requiredArgs____.slug (Backend.ScalarCodecs.codecs |> Backend.Scalar.unwrapEncoder .codecSlug) ] object____ Basics.identity


{-| Trigger a user synchronization

This mutation will trigger a full user synchronization with the connected Google Workspace. The action is
asynchronous.

-}
synchronizeUsers :
    SelectionSet decodesTo Backend.Object.UserSync
    -> SelectionSet decodesTo RootMutation
synchronizeUsers object____ =
    Object.selectionForCompositeField "synchronizeUsers" [] object____ Basics.identity
