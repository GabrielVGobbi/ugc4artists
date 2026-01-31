import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import AppLogo, { AppLogoIcon } from "../app-logo"

function StackedCircularFooter() {
    return (
        <footer className="bg-secondary py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center">
                    <div className="mb-8 rounded-full bg-white p-8">
                        <AppLogoIcon />
                    </div>
                    {/*
                    <nav className="mb-8 flex flex-wrap justify-center gap-6">
                        <a href="#" className="hover:text-primary">Home</a>
                        <a href="#" className="hover:text-primary">Sobre</a>
                        <a href="#" className="hover:text-primary">Serviços</a>
                        <a href="#" className="hover:text-primary">Grupo</a>
                        <a href="#" className="hover:text-primary">Contato</a>
                    </nav>
                    */}
                    <div className="mb-8 flex space-x-4">


                        <Button variant="outline" size="icon" className="rounded-full">
                            <a href="https://www.instagram.com/ugc4artists/" className="" target="_blank">
                                <Instagram className="h-4 w-4" />
                                <span className="sr-only">Instagram</span>
                            </a>
                        </Button>

                    </div>
                    <div className="mb-8 w-full max-w-md">
                        <form className="flex space-x-2">
                            <div className="flex-grow">
                                <Label htmlFor="email" className="sr-only">Email</Label>
                                <Input id="email" placeholder="Seu email" type="email" className="rounded-full" />
                            </div>
                            <Button size={"none"} type="submit" className="rounded-full h-9 px-5">Se-inscreva</Button>
                        </form>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            © 2025 UGCFORARTISTS. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export { StackedCircularFooter }
