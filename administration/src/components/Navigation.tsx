import React, {useContext} from "react";
import {Button, Navbar} from "@blueprintjs/core";
import {NavLink} from "react-router-dom";
import {Alignment} from "@blueprintjs/core/lib/esm/common/alignment";
import {RegionContext} from "../RegionProvider";
import {AuthContext} from "../AuthProvider";
import {Role} from "../generated/graphql";

interface Props {
    onSignOut: () => void
}

const Navigation = (props: Props) => {
    const region = useContext(RegionContext)
    const role = useContext(AuthContext).data?.administrator.role
    return (
        <Navbar>
            <Navbar.Group>
                <Navbar.Heading>Ehrenamtskarte Administration</Navbar.Heading>
                <Navbar.Divider/>
                {region == null ? null : <><span>{region?.name ?? ""}</span>
                    <Navbar.Divider/></>
                }
                <NavLink to={"/"}><Button minimal icon="home" text="Home"/></NavLink>
                {(role === Role.RegionAdmin || role === Role.RegionManager)
                    ? <>
                        <NavLink to={"/applications"}><Button minimal icon="form" text="Eingehende Anträge"/></NavLink>
                        <NavLink to={"/eak-generation"}><Button minimal icon="id-number"
                                                                text="Karten erstellen"/></NavLink>
                    </>
                    : null}
                {(role === Role.ProjectAdmin || role === Role.RegionAdmin)
                    ? <>
                        <NavLink to={"/users"}><Button minimal icon="people" text="Benutzer verwalten"/></NavLink>
                    </>
                    : null}
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
                <Button minimal icon="log-out" text="Logout" onClick={props.onSignOut}/>
            </Navbar.Group>
        </Navbar>
    )
};

export default Navigation;
