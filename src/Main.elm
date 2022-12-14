module Main exposing (..)

import Api.Do exposing (query)
import Api.User exposing (UserData)
import Browser exposing (Document)
import Browser.Navigation as Nav
import Graphql.Http
import Html exposing (Html, a, div, h1, header, li, main_, nav, p, text, ul)
import Html.Attributes exposing (class, classList, href, id)
import Page.CreateTeam as CreateTeam
import Page.Error as Error
import Page.Home as Home
import Page.ReconcilerAdmin as ReconcilerAdmin
import Page.Team as Team exposing (slugstr)
import Page.Teams as Teams
import RemoteData exposing (RemoteData(..))
import Route exposing (Route(..), link)
import Session exposing (Session, User(..))
import Url
import Url.Builder



---- MODEL ----


type Model
    = Home Home.Model
    | Admin ReconcilerAdmin.Model
    | Team Team.Model
    | Teams Teams.Model
    | CreateTeam CreateTeam.Model
    | Error Error.Model



---- UPDATE ----


type Msg
    = NoOp
    | GotMeResponse Url.Url (Result (Graphql.Http.Error (Maybe UserData)) (Maybe UserData))
    | GotHomeMsg Home.Msg
    | GotAdminMsg ReconcilerAdmin.Msg
    | GotTeamMsg Team.Msg
    | GotTeamsMsg Teams.Msg
    | GotCreateTeamMsg CreateTeam.Msg
    | LinkClicked Browser.UrlRequest
    | UrlChanged Url.Url


init : a -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init _ url nk =
    ( Home (Home.init (Session.init nk) (Route.fromUrl url)), getMe url )



-- just use the home model's init in main (should be route based later on)


updateWith : (subModel -> Model) -> (subMsg -> Msg) -> ( subModel, Cmd subMsg ) -> ( Model, Cmd Msg )
updateWith toModel toMsg ( subModel, subCmd ) =
    ( toModel subModel
    , Cmd.map toMsg subCmd
    )


changeRouteTo : Maybe Route -> Session -> ( Model, Cmd Msg )
changeRouteTo maybeRoute session =
    case Session.user session of
        Anonymous ->
            ( Home (Home.init session maybeRoute), Cmd.none )

        Unknown ->
            ( Home (Home.init session maybeRoute), Cmd.none )

        LoggedIn _ ->
            case maybeRoute of
                Just Route.Home ->
                    ( Home (Home.init session maybeRoute)
                    , Nav.pushUrl (Session.navKey session) (Route.routeToString Route.MyTeams)
                    )

                Just Route.ReconcilerAdmin ->
                    ReconcilerAdmin.init session |> updateWith Admin GotAdminMsg

                Just Route.CreateTeam ->
                    CreateTeam.init session |> updateWith CreateTeam GotCreateTeamMsg

                Just Route.AllTeams ->
                    Teams.init session Teams.AllTeams |> updateWith Teams GotTeamsMsg

                Just Route.MyTeams ->
                    Teams.init session Teams.MyTeams |> updateWith Teams GotTeamsMsg

                Just (Route.Team id) ->
                    Team.init session id |> updateWith Team GotTeamMsg

                Nothing ->
                    Error.init session "404" |> updateWith Error (\_ -> NoOp)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        -- Add handler here when we add new modules
        ( LinkClicked urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    case Route.fromUrl url of
                        Just _ ->
                            ( model, Nav.pushUrl (toSession model |> Session.navKey) (Url.toString url) )

                        Nothing ->
                            ( model, Nav.load <| Url.toString url )

                Browser.External href ->
                    ( model, Nav.load href )

        ( UrlChanged url, _ ) ->
            changeRouteTo (Route.fromUrl url) (toSession model)

        ( GotHomeMsg subMsg, Home subModel ) ->
            Home.update subMsg subModel |> updateWith Home GotHomeMsg

        ( GotAdminMsg subMsg, Admin subModel ) ->
            ReconcilerAdmin.update subMsg subModel |> updateWith Admin GotAdminMsg

        ( GotTeamMsg subMsg, Team subModel ) ->
            Team.update subMsg subModel |> updateWith Team GotTeamMsg

        ( GotTeamsMsg subMsg, Teams subModel ) ->
            Teams.update subMsg subModel |> updateWith Teams GotTeamsMsg

        ( GotCreateTeamMsg (CreateTeam.GotTeamCreatedResponse (Ok team)), CreateTeam subModel ) ->
            ( model, Nav.pushUrl (Session.navKey subModel.session) (Route.routeToString (Route.Team team.slug)) )

        ( GotCreateTeamMsg subMsg, CreateTeam subModel ) ->
            CreateTeam.update subMsg subModel |> updateWith CreateTeam GotCreateTeamMsg

        ( GotMeResponse url r, _ ) ->
            handleMeResponse (toSession model) url r

        ( _, _ ) ->
            ( model, Cmd.none )



-- (_, _) ->
--     Debug.log "got update from invalid location"
---- VIEW ----


view : Model -> Document Msg
view model =
    let
        html =
            case model of
                -- Add new view here when we add new modules
                Home subModel ->
                    Home.view subModel |> Html.map GotHomeMsg

                Admin subModel ->
                    ReconcilerAdmin.view subModel |> Html.map GotAdminMsg

                Team subModel ->
                    Team.view subModel |> Html.map GotTeamMsg

                Teams subModel ->
                    Teams.view subModel |> Html.map GotTeamsMsg

                CreateTeam subModel ->
                    CreateTeam.view subModel |> Html.map GotCreateTeamMsg

                Error subModel ->
                    Error.view subModel |> Html.map (\_ -> NoOp)

        user =
            Session.user (toSession model)

        logoutURL =
            Url.Builder.absolute [ "oauth2", "logout" ] []

        loginURL =
            Url.Builder.absolute [ "oauth2", "login" ] []

        auth =
            case user of
                LoggedIn loggedInUser ->
                    div [ class "user-info" ]
                        [ p [] [ text loggedInUser.name ]
                        , a [ href logoutURL, class "button small" ] [ text "Logout" ]
                        ]

                _ ->
                    a [ href loginURL, class "button small" ] [ text "Login" ]
    in
    { title = "NAIS console"
    , body =
        [ header []
            [ div [ class "content" ]
                [ div []
                    [ div [ id "logo" ] []
                    , h1 []
                        [ link Route.Home [] [ text "Console" ]
                        ]
                    ]
                , auth
                ]
            ]
        , div [ id "layout" ]
            [ viewNav model
            , main_ []
                [ html ]
            , div [] []
            ]
        ]
    }


viewNav : Model -> Html msg
viewNav model =
    let
        user =
            Session.user (toSession model)

        teamsButton =
            [ menuItem model Route.MyTeams False "Teams" ]

        ephemeralButtons =
            case model of
                Team teamPage ->
                    case teamPage.team of
                        Success team ->
                            [ menuItem model (Route.Team team.slug) True (slugstr team.slug) ]

                        _ ->
                            []

                CreateTeam _ ->
                    [ menuItem model Route.CreateTeam True "Create team"
                    ]

                _ ->
                    []

        adminButton =
            if Session.isGlobalAdmin (Session.user (toSession model)) then
                [ menuItem model Route.ReconcilerAdmin False "Synchronizers" ]

            else
                []
    in
    case user of
        LoggedIn _ ->
            nav [] [ ul [] (teamsButton ++ ephemeralButtons ++ adminButton) ]

        _ ->
            nav [] []


isActiveRoute : Model -> Route -> Bool
isActiveRoute model target =
    case ( model, target ) of
        ( Home _, Route.Home ) ->
            True

        ( Teams _, Route.MyTeams ) ->
            True

        ( CreateTeam _, Route.CreateTeam ) ->
            True

        ( Team _, Route.Team _ ) ->
            True

        ( Admin _, Route.ReconcilerAdmin ) ->
            True

        ( _, _ ) ->
            False


menuItem : Model -> Route -> Bool -> String -> Html.Html msg
menuItem model target indent title =
    let
        classes =
            [ ( "active", isActiveRoute model target ) -- Remember to update isActiveRoute with model/route combo
            , ( "indent", indent ) -- Remember to update isActiveRoute with model/route combo
            ]
    in
    li [ classList classes ] [ link target [ Html.Attributes.title title ] [ text title ] ]



---- PROGRAM ----


main : Program () Model Msg
main =
    Browser.application
        { view = view
        , init = init
        , update = update
        , subscriptions = always Sub.none
        , onUrlRequest = LinkClicked
        , onUrlChange = UrlChanged
        }


toSession : Model -> Session
toSession model =
    case model of
        Home m ->
            m.session

        Admin m ->
            m.session

        Error m ->
            m.session

        Team m ->
            m.session

        Teams m ->
            m.session

        CreateTeam m ->
            m.session


getMe : Url.Url -> Cmd Msg
getMe url =
    query Api.User.getMe (GotMeResponse url)


handleMeResponse : Session -> Url.Url -> Result (Graphql.Http.Error (Maybe UserData)) (Maybe UserData) -> ( Model, Cmd Msg )
handleMeResponse session url result =
    case result of
        Ok maybeU ->
            case maybeU of
                Just u ->
                    changeRouteTo (Route.fromUrl url) (Session.mapUser (Session.LoggedIn u) session)

                Nothing ->
                    changeRouteTo (Route.fromUrl url) (Session.mapUser Session.Anonymous session)

        Err _ ->
            changeRouteTo (Route.fromUrl url) (Session.mapUser Session.Anonymous session)
