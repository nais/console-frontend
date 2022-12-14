module Page.CreateTeam exposing (..)

import Api.Do
import Api.Error exposing (errorToString)
import Api.Team exposing (TeamData, createTeam)
import Backend.Scalar
import Graphql.Http exposing (RawError(..))
import Graphql.OptionalArgument
import Html exposing (Html, button, div, form, h2, input, label, li, p, text, ul)
import Html.Attributes exposing (class, for, placeholder, type_)
import Html.Events exposing (onInput, onSubmit)
import Session exposing (Session)


type alias Model =
    { session : Session
    , slug : String
    , purpose : String
    , slackAlertChannel : String
    , error : Maybe String
    }


type Msg
    = CreateTeamSubmit
    | GotTeamCreatedResponse (Result (Graphql.Http.Error TeamData) TeamData)
    | SlugChanged String
    | PurposeChanged String
    | SlackChannelChanged String


init : Session -> ( Model, Cmd Msg )
init session =
    ( { session = session
      , purpose = ""
      , slug = ""
      , slackAlertChannel = ""
      , error = Nothing
      }
    , Cmd.none
    )


blankStringMaybe : String -> Maybe String
blankStringMaybe s =
    case s of
        "" ->
            Nothing

        _ ->
            Just s


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        CreateTeamSubmit ->
            ( model
            , Api.Do.mutate
                (createTeam
                    { purpose = model.purpose
                    , slug = Backend.Scalar.Slug model.slug
                    , slackAlertsChannel = model.slackAlertChannel
                    }
                )
                GotTeamCreatedResponse
            )

        GotTeamCreatedResponse (Ok _) ->
            ( { model | error = Nothing }, Cmd.none )

        GotTeamCreatedResponse (Err e) ->
            ( { model | error = Just (errorToString e) }, Cmd.none )

        SlugChanged s ->
            ( { model | slug = s }, Cmd.none )

        PurposeChanged s ->
            ( { model | purpose = s }, Cmd.none )

        SlackChannelChanged s ->
            ( { model | slackAlertChannel = s }, Cmd.none )


textbox : (String -> Msg) -> String -> String -> String -> Html Msg
textbox msg id lbl placeholder =
    li []
        [ label [ for id ] [ text lbl ]
        , input [ type_ "text", Html.Attributes.placeholder placeholder, onInput msg ] []
        ]


errorView : Maybe String -> List (Html msg)
errorView maybeString =
    case maybeString of
        Nothing ->
            []

        Just s ->
            [ div [ class "error" ] [ text s ] ]


createTeamForm : Model -> Html Msg
createTeamForm model =
    div [ class "card" ]
        [ h2 [] [ text "Create a new team" ]
        , p [] [ text "Creating a team in Console will grant access to certain NAIS features, such as Google Cloud projects, Kubernetes namespaces, or your own GitHub team." ]
        , p [] [ text "After the team is created, you will become the administrator of that team, granting privileges to add and remove team members." ]
        , p [] [ text "The identifier is the primary key, and will be used across systems so that they are easily recognizable. It is not possible to change the identifier after creation, so choose wisely. Also, the identifier can not start with \"nais\" or \"team\"." ]
        , form [ onSubmit CreateTeamSubmit ]
            (ul []
                [ textbox SlugChanged "slug" "Identifier" "customer-satisfaction"
                , textbox PurposeChanged "purpose" "Purpose of the team" "Making sure customers have a good user experience"
                , textbox SlackChannelChanged "slack-alert-channel" "Slack alert channel" "#my-team-alerts"
                ]
                :: errorView model.error
                ++ [ div [ class "button-row" ]
                        [ button [ type_ "submit" ] [ text "Create team" ]
                        ]
                   ]
            )
        ]


view : Model -> Html Msg
view model =
    createTeamForm model
